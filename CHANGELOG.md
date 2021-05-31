# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
