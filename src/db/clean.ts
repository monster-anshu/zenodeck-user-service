import { mongoConnection } from '@/mongo/connection';
import {
  AddonModel,
  CompanyModel,
  CompanyProductModel,
  CompanyUserModel,
  PackageModel,
  UserModel,
} from '../mongo';

const main = async () => {
  await mongoConnection();
  await Promise.all([
    AddonModel.deleteMany({}),
    CompanyModel.deleteMany({}),
    CompanyProductModel.deleteMany({}),
    CompanyUserModel.deleteMany({}),
    PackageModel.deleteMany({}),
    UserModel.deleteMany({}),
  ]);
  console.log('DB cleaned');
  process.exit(0);
};

main();
