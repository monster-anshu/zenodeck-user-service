import { AddonModel, PackageModel } from '@/mongo';
import { Types } from 'mongoose';
import addonData from './zenodeck.addons.json';
import packageData from './zenodeck.packages.json';
import { mongoConnection } from '@/mongo/connection';
import { Type } from '@aws-sdk/client-s3';

const addonSeeder = async () => {
  const documents = addonData.map((item) => {
    return {
      ...item,
      packageIds: item.packageIds?.map((id) => new Types.ObjectId(id.$oid)),
      _id: new Types.ObjectId(item._id.$oid),
    };
  });

  await AddonModel.insertMany(documents);
  console.log('Addon Seeder done');
};

const packageSeeder = async () => {
  const documents = packageData.map((item) => {
    return {
      ...item,
      _id: new Types.ObjectId(item._id.$oid),
      addons: item.addons.map((addon) => ({
        ...addon,
        addonId: new Types.ObjectId(addon.addonId.$oid),
      })),
      features: item.features.map((feature) => ({
        ...feature,
        _id:
          '_id' in feature ? new Types.ObjectId(feature._id?.$oid) : undefined,
      })),
    };
  });

  await PackageModel.insertMany(documents);
  console.log('Package Seeder done');
};

const main = async () => {
  await Promise.all([addonSeeder(), packageSeeder()]);
  process.exit(0);
};

main();
