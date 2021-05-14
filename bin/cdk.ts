#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { DigitalWorkstation } from '../lib/digital-workstation-stack';

const app = new cdk.App();
new DigitalWorkstation(app, 'DigitalWorkstation', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'eu-central-1' },
  keyName: 'JamulusKey',
  bandServerSettings: {
    ipId: 'eipalloc-4d0de976',
    settingsFileName: 'band-server-settings.sh',
    imageId: 'ami-075e42d91002be826',
  },
  mixingResultServerSettings: {
    ipId: 'eipalloc-7680094d',
    settingsFileName: 'mixing-server-settings.sh',
    imageId: 'ami-04e4753b514544b93',
  },
  onlineMixerSettings: {
    ipId: 'eipalloc-3baa7e00',
    // imageId: '',
  },
});
