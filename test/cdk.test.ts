import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import { App } from '@aws-cdk/core';
import { DigitalWorkstation } from '../lib/digital-workstation-stack';

test('Empty Stack', () => {
    const app = new App();
    // WHEN
    const stack = new DigitalWorkstation(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
