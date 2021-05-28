#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { DigitalWorkstation } from '../lib/digital-workstation-stack';
const { env, ...config } = require('./config.json');

const settings = {
  env: {
    account: env.account || process.env.CDK_DEFAULT_ACCOUNT,
    region: env.region,
  },
  ...config,
};

const app = new cdk.App();
new DigitalWorkstation(app, 'DigitalWorkstation', settings);
