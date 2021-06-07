# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.8.0](https://github.com/cabcookie/aws-jamulus/compare/v1.7.0...v1.8.0) (2021-06-07)


### Features

* pre-install Ardour plugins [#23](https://github.com/cabcookie/aws-jamulus/issues/23) ([0efe47b](https://github.com/cabcookie/aws-jamulus/commit/0efe47bcd420c1f14845377ec8bd8434bdbdb965))
* updated Ardour session ([a810975](https://github.com/cabcookie/aws-jamulus/commit/a81097518380a13f16283b66906b04bde641567e))


### Bug Fixes

* adapted to the new Ardour session ([cc0bc0d](https://github.com/cabcookie/aws-jamulus/commit/cc0bc0d803e53493f0f41ba6317e33cf210ea9a2))
* meter channel names ([59b424c](https://github.com/cabcookie/aws-jamulus/commit/59b424c18073f8d62c72380938e24ca116030ff9))
* **template:** playlist search ([7842610](https://github.com/cabcookie/aws-jamulus/commit/7842610977ec35172c5333a6073ae8d557b3c78a))
* addind inis to connect with the mixing server ([6c0fcef](https://github.com/cabcookie/aws-jamulus/commit/6c0fcef40b7d4dc7af428962ce21893f02a9c3d9))
* adjusted aux send to Mix To Zoom ([22b2c28](https://github.com/cabcookie/aws-jamulus/commit/22b2c28114825b77b96d3d2f3b3b31fc223903ee))
* adjusting jamulus startup script ([270f89e](https://github.com/cabcookie/aws-jamulus/commit/270f89edd90ce7d2a2b1e3c87429df36011e2d36))
* correct Windows Jamulus client command [#25](https://github.com/cabcookie/aws-jamulus/issues/25) ([24ef108](https://github.com/cabcookie/aws-jamulus/commit/24ef108854dd14bea0d6a10c34a8a7db88e7c8af))
* install CloudWatch agent optionally ([5f97c99](https://github.com/cabcookie/aws-jamulus/commit/5f97c99bfb65044422a8301bb440506c81c4bafa))
* removing ids ([64ddb9b](https://github.com/cabcookie/aws-jamulus/commit/64ddb9bb9b5d52a0bcb520b6568c99562dc65619))
* show changes in config.json in init script ([7c84935](https://github.com/cabcookie/aws-jamulus/commit/7c849354e20febe39afd20bf9c02429eda5f6648))
* understand routing to Mix To Zoom ([5dacd88](https://github.com/cabcookie/aws-jamulus/commit/5dacd88e1fc3f876a0fb8085826141caf51b8a36))
* **infra:** switch off animations on Ubuntu ([d4d2cde](https://github.com/cabcookie/aws-jamulus/commit/d4d2cde0adfa34aecbfd065282b67c41b4031d2c))

## [1.7.0](https://github.com/cabcookie/aws-jamulus/compare/v1.6.4...v1.7.0) (2021-06-05)


### Features

* adding `publicIp` to the config ([8aa0b5b](https://github.com/cabcookie/aws-jamulus/commit/8aa0b5b411703994255584835f2970d840c1ca46))
* fetched MixToZoom.ini ([9ace263](https://github.com/cabcookie/aws-jamulus/commit/9ace2630d0bc578b914d624b9114ec9f70750501))
* jamulus client packages are on S3 [#17](https://github.com/cabcookie/aws-jamulus/issues/17) ([e735821](https://github.com/cabcookie/aws-jamulus/commit/e7358215dc672f5dd5afd59e2593efbbcc8017e1))
* updated Jamulus client on audio workstation ([18a050a](https://github.com/cabcookie/aws-jamulus/commit/18a050a2ef840ba9be71d13aafa63028afab340b))


### Bug Fixes

* added connection to mixing instance ([6e75221](https://github.com/cabcookie/aws-jamulus/commit/6e752219d4ae57f4d4c31e5257eacfce14e127f5))
* **files:** issues with file-handling ([972c57e](https://github.com/cabcookie/aws-jamulus/commit/972c57e0dcf79baf5f435f7b4e81d051ab4501ac))
* **patches:** dependency updates ([b3499c3](https://github.com/cabcookie/aws-jamulus/commit/b3499c3ec0d936aba06d080c0e292dc52248fbc2))
* **refactor:** `jamulus-startups.sh` ([8c18795](https://github.com/cabcookie/aws-jamulus/commit/8c187955bf96005678a5f202e0a95fa4d8d13ede))
* **refactor:** Ardour session created locally ([620c4d0](https://github.com/cabcookie/aws-jamulus/commit/620c4d0fb30b3cbcb99f868039da310839800d02))
* **refactor:** correct `jamulus-startup.sh` folder ([d69e877](https://github.com/cabcookie/aws-jamulus/commit/d69e8779665cf33256ce9e2378a8a9602a7d4503))
* **refactor:** creating jamulus inis from client ([8d56eda](https://github.com/cabcookie/aws-jamulus/commit/8d56eda3524ee21763b3a7579b6d154307c45c79))
* **refactor:** interfaces for channels and jamulus ([b78ce40](https://github.com/cabcookie/aws-jamulus/commit/b78ce400c2e2d77ac423e7886c5b34ee58f00946))
* **refactor:** workstation initialization file ([0358d02](https://github.com/cabcookie/aws-jamulus/commit/0358d0227dbce7f5f4dda16ffeee469d86da7011))
* **rename:** folder `ardour` to `mosaik-live` ([6aac4cd](https://github.com/cabcookie/aws-jamulus/commit/6aac4cd14a82579eaaf4c285e40d9fab2bae0661))
* **security:** remove IP addresses [#16](https://github.com/cabcookie/aws-jamulus/issues/16) ([a9cf115](https://github.com/cabcookie/aws-jamulus/commit/a9cf115b14115f94aae4bd2b1192a1f1693e0704))

### [1.6.4](https://github.com/cabcookie/aws-jamulus/compare/v1.6.3...v1.6.4) (2021-06-03)


### Bug Fixes

* **doc:** describe placeholders ([84d8253](https://github.com/cabcookie/aws-jamulus/commit/84d82531ab46e9230b8c3c8525748c14eeaab21c))
* **log:** adding app version number to logging ([fdbec7f](https://github.com/cabcookie/aws-jamulus/commit/fdbec7f184e06fe2e7a81aa21d43e1f19226bba6))
* **refactor:** foundation for deploying resources ([b1efd3f](https://github.com/cabcookie/aws-jamulus/commit/b1efd3f5db42d5173af6adc17508be242987bbb8))
* **refactor:** getting standard vpc, instance role ([51ac4e4](https://github.com/cabcookie/aws-jamulus/commit/51ac4e4887293f457e808e67b73ba3670f6ca5c9))
* **refactor:** moved CloudWatch Linux settings ([828654b](https://github.com/cabcookie/aws-jamulus/commit/828654b16b4e85021b422232b20e56448f21da40))
* **refactor:** need to add the `configBucket` ([260ba9e](https://github.com/cabcookie/aws-jamulus/commit/260ba9ee13315a2136521c33816b6edd40a7c5a5))
* **refactor:** only folders are allowed as assets ([55a0f9d](https://github.com/cabcookie/aws-jamulus/commit/55a0f9d0d685fbdef1318a910b08af2278c13789))
* **refactor:** provide config data on demand ([e360ec4](https://github.com/cabcookie/aws-jamulus/commit/e360ec4060833f4cefe5ad338f0ab6eeedcb01f5))
* adjusted timezone of instances ([1adc4e3](https://github.com/cabcookie/aws-jamulus/commit/1adc4e3867f545fac9e9516af9cd3d253202af9f))
* **refactor:** simplified user data creation ([2278d77](https://github.com/cabcookie/aws-jamulus/commit/2278d7726460578c1b4b280a502e9d4cb93fcc03))

### [1.6.3](https://github.com/cabcookie/aws-jamulus/compare/v1.6.2...v1.6.3) (2021-06-03)


### Bug Fixes

* dependencies ([78ec806](https://github.com/cabcookie/aws-jamulus/commit/78ec806b593f267fae9182519e0dbd923e91b907))

### [1.6.2](https://github.com/cabcookie/aws-jamulus/compare/v1.6.1...v1.6.2) (2021-06-03)


### Bug Fixes

* **doc:** documented settings in `config.json` [#10](https://github.com/cabcookie/aws-jamulus/issues/10) ([6ac75d4](https://github.com/cabcookie/aws-jamulus/commit/6ac75d4dc53b5b262c8d3d690b6e033b1d93f583))

### [1.6.1](https://github.com/cabcookie/aws-jamulus/compare/v1.6.0...v1.6.1) (2021-06-02)


### Bug Fixes

* **doc:** `ConfigBucketDeployment` constructor ([3ff0a6a](https://github.com/cabcookie/aws-jamulus/commit/3ff0a6aa381fedd1487927690fcabf06e152eeec))
* **doc:** document server settings ([a074bf6](https://github.com/cabcookie/aws-jamulus/commit/a074bf6696151d884a4db9b9bbd6016a59f6fa7a))
* **doc:** documenting constructors and properties ([9f37fa1](https://github.com/cabcookie/aws-jamulus/commit/9f37fa1c69bad61a0ab1cf56bc6d49e79681022f))
* **infra:** better naming for servers ([5a96fef](https://github.com/cabcookie/aws-jamulus/commit/5a96fef1aa43a2663e404055a6f066e51580613d))
* **infra:** renaming of files to reflect changes ([5330a75](https://github.com/cabcookie/aws-jamulus/commit/5330a7599b29429ccfc41f248c00f0f2c1dcd1e8))
* **refactor:** `create-config-bucket.ts` renamed ([027e86c](https://github.com/cabcookie/aws-jamulus/commit/027e86c8c8d0f35c48e39278dfc94876eb47c3d5))
* **refactor:** `ZoomServer` as a class ([55dae2e](https://github.com/cabcookie/aws-jamulus/commit/55dae2eda5a4e53fbdd3ecf276b5bd4dbaa0d586))
* **refactor:** bucket deployment in separate class ([427a91c](https://github.com/cabcookie/aws-jamulus/commit/427a91ce0212f8c8384213ee8f1836717c0aed72))
* **refactor:** creation of Jamulus server ([cdfdb7d](https://github.com/cabcookie/aws-jamulus/commit/cdfdb7d955611304011faf57dccd79f03bded9d8))
* **refactor:** make `ConfigBucket`a class ([a7bc152](https://github.com/cabcookie/aws-jamulus/commit/a7bc152a1e300d9d8c4c0b7303e358085216b2e5))
* **refactor:** make `JamulusServer` class ([501880f](https://github.com/cabcookie/aws-jamulus/commit/501880f00beb0a5fca30b6a9839c8ebb61773d0c))
* **refactor:** renamed `create-zoom-server.ts` to ([a338266](https://github.com/cabcookie/aws-jamulus/commit/a338266b46b5d88da389a1dd86381d0303162e5c))
* **refactor:** renamed some properties ([4aa613d](https://github.com/cabcookie/aws-jamulus/commit/4aa613d6c2a0cae7d1ade4b30f46e94e38f865f2))
* **refactor:** renamed some settings ([c19cb70](https://github.com/cabcookie/aws-jamulus/commit/c19cb704ecd6c78bbc0bb5f26a95188c734ef6b3))
* **refactor:** reuse settings for resource props ([5c551ad](https://github.com/cabcookie/aws-jamulus/commit/5c551ad52c6810c6b55d1efbfab88cbe93a2ce86))
* **refactor:** settings and properties ([93b0d66](https://github.com/cabcookie/aws-jamulus/commit/93b0d66066deac10814089ddabb2a5b60453a532))

## [1.6.0](https://github.com/cabcookie/aws-jamulus/compare/v1.5.1...v1.6.0) (2021-06-01)


### Features

* Ardour session is created automatically ([665b1e4](https://github.com/cabcookie/aws-jamulus/commit/665b1e476e83fd72b47e9bbdcf4afe2a7589d175))
* full Ardour session with 10 channels ([46936a8](https://github.com/cabcookie/aws-jamulus/commit/46936a8cf7be56d8093ea000947e582dc8a17170))


### Bug Fixes

* cleanup for production ([29d0dc0](https://github.com/cabcookie/aws-jamulus/commit/29d0dc07887ecef1f46b1585e8bf606639f501ca))
* used wrong folder in `runProdScript()` ([9bb8a15](https://github.com/cabcookie/aws-jamulus/commit/9bb8a159bb3b6d20861d0c323dd74c5be5535a1a))
* **template:** replacing all ids ([e73cea7](https://github.com/cabcookie/aws-jamulus/commit/e73cea7c3e63fd28722082187b63b2bc56b5f98e))
* **template:** this is the desired result ([f6c1e78](https://github.com/cabcookie/aws-jamulus/commit/f6c1e785af94781b3e87e22d5978e79b29356171))
* **template:** works well now ([e796871](https://github.com/cabcookie/aws-jamulus/commit/e796871910d5c2ca140106f4d62b2af2a8e34a94))

### [1.5.1](https://github.com/cabcookie/aws-jamulus/compare/v1.5.0...v1.5.1) (2021-06-01)


### Bug Fixes

* **ardour:** adding and connecting channels ([b8af8c5](https://github.com/cabcookie/aws-jamulus/commit/b8af8c5e850758cf3c8a8a40a1b734b813be000d))
* **ardour:** master connects to system:playback ([eb2bdf2](https://github.com/cabcookie/aws-jamulus/commit/eb2bdf2251bb582d888077b48eb334ed03b356cf))
* starting Ardour with the session file ([904fcec](https://github.com/cabcookie/aws-jamulus/commit/904fcec26ae51e63e9f3c1ba320df4a761b88a38))

## [1.5.0](https://github.com/cabcookie/aws-jamulus/compare/v1.4.4...v1.5.0) (2021-06-01)


### Features

* a basic Ardour session with no settings ([30a20ea](https://github.com/cabcookie/aws-jamulus/commit/30a20eab1c20d5551497584eab7e4fe72ffd5e5e))
* add switch for adding the CloudWatch agent or not ([58fee5c](https://github.com/cabcookie/aws-jamulus/commit/58fee5cf8a62a3c43aed9750bd0a593e2f3ac117))
* created basic Ardour file/folder ([93d53c7](https://github.com/cabcookie/aws-jamulus/commit/93d53c7b7fa96a4d13b92bc81b68da017e49ee17))


### Bug Fixes

* `jamulus-startup.desktop` is working again ([c3054a3](https://github.com/cabcookie/aws-jamulus/commit/c3054a3b390ab3d161f4a5a1e62db987a8548724))
* added audio connection to Ardour ([17205d9](https://github.com/cabcookie/aws-jamulus/commit/17205d9b09a16869ae28072e01c773af56e1315b))
* Ardour works, startup script adjusted ([7e5be45](https://github.com/cabcookie/aws-jamulus/commit/7e5be45ba7d290495eef3d81b6fc9594076fbbe5))
* cleanup of imports ([4365dbb](https://github.com/cabcookie/aws-jamulus/commit/4365dbbd6a3678f8ba00032932fcf5aaa9e3f436))
* ensuring the language pack is permanent ([c462ce5](https://github.com/cabcookie/aws-jamulus/commit/c462ce554f12f5e1707aaef31effd48155c56439))
* released all ardour connections ([945df1f](https://github.com/cabcookie/aws-jamulus/commit/945df1fd6f4e0a512c88208d8ff6c18321aa43b9))
* renaming some scripts in package.json ([5c7237e](https://github.com/cabcookie/aws-jamulus/commit/5c7237e5a6faa107ac3dd5eb88cf7c7216aae400))
* some clean up ([3c2d742](https://github.com/cabcookie/aws-jamulus/commit/3c2d74236ffbf5b3956a09bac5e057708b45ecc3))

### [1.4.4](https://github.com/cabcookie/aws-jamulus/compare/v1.4.3...v1.4.4) (2021-05-31)


### Bug Fixes

* log permissions and content of files ([70c640e](https://github.com/cabcookie/aws-jamulus/commit/70c640ecd4ea6761ba380160a47187bf3dcdba70))

### [1.4.3](https://github.com/cabcookie/aws-jamulus/compare/v1.4.2...v1.4.3) (2021-05-31)


### Bug Fixes

* change startup order for Windows ([99c182b](https://github.com/cabcookie/aws-jamulus/commit/99c182bb63d71aea7d555115ebd702c31b3b2519))

### [1.4.2](https://github.com/cabcookie/aws-jamulus/compare/v1.4.1...v1.4.2) (2021-05-31)


### Bug Fixes

* bucket is deleted on `cdk destroy` ([9097968](https://github.com/cabcookie/aws-jamulus/commit/9097968f5a08c3159a7cd6c9ec57d5daec9eef2a))

### [1.4.1](https://github.com/cabcookie/aws-jamulus/compare/v1.4.0...v1.4.1) (2021-05-31)


### Bug Fixes

* clean up ([3b4538a](https://github.com/cabcookie/aws-jamulus/commit/3b4538acaf3e9c0e0cae7f18606a7adf7bd36497))

## [1.4.0](https://github.com/cabcookie/aws-jamulus/compare/v1.3.0...v1.4.0) (2021-05-31)


### Features

* create the `jamulus-startup.sh` and inis ([bee9fcc](https://github.com/cabcookie/aws-jamulus/commit/bee9fcc4d9269cc4eadc0705030c08e178cccb9e))
* created `default.ini` file ([03f0aa2](https://github.com/cabcookie/aws-jamulus/commit/03f0aa2d009242770c53e987bfb50e503ecebccb))
* enable replacing IP address placeholders ([2aa9fd4](https://github.com/cabcookie/aws-jamulus/commit/2aa9fd43499e02cff04cf2e043b17fa653077aa7))
* prepare for providing channel config ([b2bca01](https://github.com/cabcookie/aws-jamulus/commit/b2bca011602f13d15769b7f4ee3a9391f666771c))
* should create Jamulus client packages ([b7b1b3c](https://github.com/cabcookie/aws-jamulus/commit/b7b1b3c72f68225f6cf92df0484e0d426721e54b))
* the `config.json` includes now the channels ([beeedb2](https://github.com/cabcookie/aws-jamulus/commit/beeedb29a2b31d9bb040929305f22fcdf28da2ff))


### Bug Fixes

* channel names for mixer too long ([06274cb](https://github.com/cabcookie/aws-jamulus/commit/06274cb8edcf674d975723c0d2ab188068d18af4))
* corrected the ini file names ([2bd913b](https://github.com/cabcookie/aws-jamulus/commit/2bd913b8d96f22c9af869e8bb6530ce920404acb))
* created Jack configuration ([99e2061](https://github.com/cabcookie/aws-jamulus/commit/99e20616b4f807af3781293484314f8c36a74c0f))
* deleting all ini files ([078ca5c](https://github.com/cabcookie/aws-jamulus/commit/078ca5c45ed75f5ea62c0af6839ef7f1d6ddd482))
* fix jamulus-startup.sh issues ([cf7ba79](https://github.com/cabcookie/aws-jamulus/commit/cf7ba799b24bf26ebf5e761b34911d1aa34fa03d))
* missed " around the client name for macOS ([ddc8f45](https://github.com/cabcookie/aws-jamulus/commit/ddc8f45e0a930994d960b0490250c03d01910a9c))
* missed the `create-config-files.js` ([7fc33a8](https://github.com/cabcookie/aws-jamulus/commit/7fc33a87205813d7939dd65783fb810dbf12b7dd))
* refactored file creation to a fetch from S3 ([17ee4ac](https://github.com/cabcookie/aws-jamulus/commit/17ee4ac798d7568bedebba54f0145d5fcf7cf329))
* should fix error with ini folders ([0bde2bc](https://github.com/cabcookie/aws-jamulus/commit/0bde2bccbf48caf76dbec9b6d5496732f8536146))

## [1.3.0](https://github.com/cabcookie/aws-jamulus/compare/v1.2.0...v1.3.0) (2021-05-30)


### Features

* added app wrapper ([#5](https://github.com/cabcookie/aws-jamulus/issues/5)) ([9c1f774](https://github.com/cabcookie/aws-jamulus/commit/9c1f774f008c8ac2289ec2d0475dae21a5e7b75d))


### Bug Fixes

* log statement should not have \` characters ([36ee0dd](https://github.com/cabcookie/aws-jamulus/commit/36ee0ddb499c3f6553bf1a26e309b2551dff7275))

## [1.2.0](https://github.com/cabcookie/aws-jamulus/compare/v1.1.0...v1.2.0) (2021-05-28)


### Features

* apps are fully installed ([b9ffd8d](https://github.com/cabcookie/aws-jamulus/commit/b9ffd8de612511c5e8a5be47f2553b8dc951d26a))

## [1.1.0](https://github.com/cabcookie/aws-jamulus/compare/v1.0.1...v1.1.0) (2021-05-28)


### Features

* sets ubuntu password [#6](https://github.com/cabcookie/aws-jamulus/issues/6) ([e1bbf4b](https://github.com/cabcookie/aws-jamulus/commit/e1bbf4bdd53936b0dde3cc680d566f2650d2cb28))


### Bug Fixes

* removed test instance scripts ([8f97705](https://github.com/cabcookie/aws-jamulus/commit/8f977054defa50b9eef18f848a80b7650e7bcce3))

### [1.0.1](https://github.com/cabcookie/aws-jamulus/compare/v1.0.0...v1.0.1) (2021-05-28)

## 1.0.0 (2021-05-28)


### Features

* added flexible jamulus server configs ([b778f65](https://github.com/cabcookie/aws-jamulus/commit/b778f65cc8a957839cd295c5fa5fc59bfe1d10ab))
* added Zoom Windows server ([02965ff](https://github.com/cabcookie/aws-jamulus/commit/02965ffc5802e1c9c9299111b26e4b2a64cb6a19))
* adding 2nd Jamulus server for mixing result ([9fce8b1](https://github.com/cabcookie/aws-jamulus/commit/9fce8b10219b6eae5c2ed3c377f6701b89630fe5))
* adjusted Jamulus clients after service 05/23 ([a5a1d73](https://github.com/cabcookie/aws-jamulus/commit/a5a1d7371b8eb4799efbac8f374c01cdd376996d))
* allow customized role; std is just SSM ([2589c41](https://github.com/cabcookie/aws-jamulus/commit/2589c41298e38836163b6e9cb48bc6a97993e1a3))
* ardour project and jamulus ini files copied ([175c978](https://github.com/cabcookie/aws-jamulus/commit/175c97837fd7eaacc7648122a11528e388852252))
* configured launch script and server config ([2755dc1](https://github.com/cabcookie/aws-jamulus/commit/2755dc1a7fae3dca95c947939c493b92fac552d4))
* created fresh images ([74633ff](https://github.com/cabcookie/aws-jamulus/commit/74633ff2bc4d05bbe80d6cd6655a9101ef9d59a2))
* created images for Jamulus servers ([324b460](https://github.com/cabcookie/aws-jamulus/commit/324b460aa010f7baf6c8a3288f20485e7a70f77d))
* created user data for windows instance ([f1dbf05](https://github.com/cabcookie/aws-jamulus/commit/f1dbf054c6fee42b98b832441a94483fedd3ce75))
* defined next steps to get fully automated ([d0e59bf](https://github.com/cabcookie/aws-jamulus/commit/d0e59bf24d96c799bd4f4a2505b21f922324ccc0))
* image for online mixer created ([e99df08](https://github.com/cabcookie/aws-jamulus/commit/e99df08401fe88bc18831ffa7e50fad869404768))
* image for server and stack for mixer ([005d01e](https://github.com/cabcookie/aws-jamulus/commit/005d01e6aa2672b0c7c6176fad5ef428948acfc2))
* init cdk app ([a66c696](https://github.com/cabcookie/aws-jamulus/commit/a66c6969359fb048557b2655f5256b37f5184719))
* Jamulus server works, starts up completely ([7894e0a](https://github.com/cabcookie/aws-jamulus/commit/7894e0aae4aadf491140428982a2a048d3e65fe2))
* just some jamulus client config testing ([53bcd55](https://github.com/cabcookie/aws-jamulus/commit/53bcd55716fca4825276cd515d84ab859c8edf82))
* make replace region reusable ([9a4140d](https://github.com/cabcookie/aws-jamulus/commit/9a4140dac4f8d45d5196b4cdec4fa271f3fa250f))
* Monitor detailed EC2 metrics [#4](https://github.com/cabcookie/aws-jamulus/issues/4) ([75c34ad](https://github.com/cabcookie/aws-jamulus/commit/75c34adb61a4b86954b3a9c942eb51977e175003))
* parameterized server and stack settings ([1757ad0](https://github.com/cabcookie/aws-jamulus/commit/1757ad052a125f62739e0a5900089acc15d104d4))
* prep custom resource to delete S3 sh files ([5ef6046](https://github.com/cabcookie/aws-jamulus/commit/5ef6046ac114ceeb2274a57afd7636f14d541cf7))
* remove welcome message, upgrade to 30 chs ([58c79e3](https://github.com/cabcookie/aws-jamulus/commit/58c79e3b968b0715172c95d481c936a434813747))
* renamed ardour config folder ([b54e514](https://github.com/cabcookie/aws-jamulus/commit/b54e5146ae73b7e99914f6bd2dffee8c3b0add2f))
* renamed stack to DigitalWorkstation ([54a79d1](https://github.com/cabcookie/aws-jamulus/commit/54a79d160be97b252fb34aed42f0a97561c95961))
* renamed stack to represent complete setup ([cf7dacc](https://github.com/cabcookie/aws-jamulus/commit/cf7dacc4b947ae37477d70f85350cb30970f852e))
* separate settings from code and finish doc ([37bf2db](https://github.com/cabcookie/aws-jamulus/commit/37bf2db74e77ffb36dc09e6a8181a0fca1c22a04))
* settings after worship service on May 23rd ([f887d68](https://github.com/cabcookie/aws-jamulus/commit/f887d688e2b40c0e4a993c32260554db88b88aa2))
* updated images for jamulus and zoom server ([aadaad2](https://github.com/cabcookie/aws-jamulus/commit/aadaad21bb09df2c6fdb10779471922162421729))
* updated online mixer config ([25a60df](https://github.com/cabcookie/aws-jamulus/commit/25a60df3b9c564dee80a4a799457a30fd0dbc1c8))
* updated online mixer with all connections ([76a8538](https://github.com/cabcookie/aws-jamulus/commit/76a85380c040055a9f58cd4c9d6b594956bad758))
* updated todos ([d17503a](https://github.com/cabcookie/aws-jamulus/commit/d17503a13abefd7fc068b50b653b652cd287fde6))
* using my own AMI for the mixing console now ([685ac66](https://github.com/cabcookie/aws-jamulus/commit/685ac66c445463677d52c1118414a12d854e5e94))


### Bug Fixes

* added removal policy for S3 bucket ([87919dd](https://github.com/cabcookie/aws-jamulus/commit/87919dde1d1df5be8e1e684c09faec0f1df2f7f2))
* server didn't start ([2f4ccf3](https://github.com/cabcookie/aws-jamulus/commit/2f4ccf30666f1cb3a024a457f60f070d65e065cf))
