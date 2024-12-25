import { Product } from '@/common/const';
import { USER_SERVICE_DOMAIN } from '@/env';
import { sendEmail } from '@/lib/email';
import { CompanyModel, CompanyUserModel, UserModel } from '@/mongo';
import UserInvitationModel, { UserInvitation } from '@/mongo/user-invitation';
import { Types } from 'mongoose';

export class InvitationService {
  static async send({
    companyId,
    emailIds,
    productId,
    userId,
  }: {
    emailIds: string[];
    companyId: string;
    userId: string;
    productId: Product;
  }) {
    emailIds = emailIds.map((cur) => cur.toLowerCase());

    const { userData, userIds } = await this.getUserIdForEmail(emailIds);

    const userWithAllPermissions =
      await this.checkIfUserHasPermissionToProducts(
        Object.values(userIds),
        companyId,
        productId,
      );

    const toInviteEmailList: {
      emailId: string;
      userId: string;
      isNewUser: boolean;
    }[] = [];

    emailIds.forEach((emailId) => {
      const userObj = userData[emailId];
      if (userId && !userWithAllPermissions.includes(userId)) {
        toInviteEmailList.push({
          emailId: userObj.emailId,
          userId: userObj.userId,
          isNewUser: userObj.isNewUser,
        });
      }
    });

    const list = toInviteEmailList.map(async (curr) => {
      let invitation = await UserInvitationModel.findOne({
        emailId: curr.emailId,
        companyId: new Types.ObjectId(companyId),
        productId: productId,
        status: 'PENDING',
      }).lean();

      if (invitation?._id) {
        await UserInvitationModel.updateOne(
          {
            _id: invitation._id,
          },
          {
            $set: {
              invitedBy: new Types.ObjectId(userId),
              productId: productId,
            },
          },
        );
      } else {
        invitation = await UserInvitationModel.create({
          emailId: curr.emailId,
          companyId: new Types.ObjectId(companyId),
          status: 'PENDING',
          invitedBy: new Types.ObjectId(userId),
          productId: productId,
          invitationUuid: Date.now(),
        });
      }

      await this.mail({
        companyId: companyId,
        emailId: curr.emailId,
        invitation: invitation,
        productId: productId,
        userId: userId,
      });

      return {
        invitationId: invitation._id,
        emailId: curr.emailId,
        userId: curr.userId,
        isNewUser: curr.isNewUser,
      };
    });

    return {
      isSuccess: true,
      list: await Promise.all(list),
    };
  }

  static resend() {}

  static delete() {}

  static async mail({
    invitation,
    productId,
    companyId,
    emailId,
    userId,
  }: {
    invitation: UserInvitation & { _id: Types.ObjectId };
    emailId: string;
    userId?: string;
    companyId: string;
    productId: Product;
  }) {
    const base64InvitationId = Buffer.from(
      invitation._id + '@@' + invitation.invitationUuid,
    ).toString('base64');
    const link =
      USER_SERVICE_DOMAIN +
      `/invite?productId=${productId}&invitationId=${base64InvitationId}`;

    const companyInfo = await CompanyModel.findOne({
      _id: companyId,
    }).lean();

    await sendEmail({
      to: emailId,
      template: {
        key: 'INVITATION',
        eventData: {
          companyName: companyInfo?.companyName!,
          acceptInvitationLink: link,
          productId: productId,
        },
        userId,
      },
    });
  }

  static getUserIdForEmail = async (emailIds: string[]) => {
    const emailIdMap = new Map<string, boolean>();

    emailIds.forEach((emailId) => {
      emailIdMap.set(emailId, true);
    });

    //Find existing users
    const users = await UserModel.find(
      {
        emailId: {
          $in: emailIds,
        },
      },
      {
        emailId: 1,
      },
    );

    const userData: Record<
      string,
      { userId: string; isNewUser: boolean; emailId: string }
    > = {};

    const userIds: string[] = [];
    const deletedUsers: string[] = [];

    users.forEach((cur) => {
      const userId = cur._id.toString();

      userData[cur.emailId] = {
        userId,
        isNewUser: cur.status == 'ACTIVE' ? false : true,
        emailId: cur.emailId,
      };

      if (!['ACTIVE', 'UNVERIFIED'].includes(cur.status)) {
        deletedUsers.push(cur.emailId);
      }

      userIds.push(userId);
      emailIdMap.delete(cur.emailId);
    });

    if (deletedUsers.length) {
      await UserModel.updateMany(
        {
          emailId: {
            $in: deletedUsers,
          },
          status: {
            $nin: ['ACTIVE', 'UNVERIFIED'],
          },
        },
        {
          $set: {
            status: 'UNVERIFIED',
          },
        },
      );
    }

    //ADD new Users as status UNVERIFIED
    const newUserEmailIds = [...emailIdMap.keys()];
    const newUsers = await UserModel.insertMany(
      newUserEmailIds.map((emailId) => {
        return {
          emailId,
          status: 'UNVERIFIED',
        };
      }),
    );

    newUserEmailIds.forEach((emailId, index) => {
      const userId = newUsers[index]._id.toString();
      userData[emailId] = {
        userId,
        isNewUser: true,
        emailId: emailId,
      };
      userIds.push(userId);
    });

    return { userData, userIds };
  };

  static checkIfUserHasPermissionToProducts = async (
    userIds: string[],
    companyId: string,
    productId: Product,
  ) => {
    const users = await CompanyUserModel.find(
      {
        companyId,
        status: 'ACTIVE',
        userId: {
          $in: userIds,
        },
      },
      {
        userId: 1,
        products: 1,
      },
    ).lean();

    const userWithAllPermissions: string[] = [];

    users.forEach((cur) => {
      const missingPermission = !cur.products.includes(productId);
      if (!missingPermission) {
        userWithAllPermissions.push(cur.userId.toString());
      }
    });

    return userWithAllPermissions;
  };
}
