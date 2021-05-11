import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import { App } from '@aws-cdk/core';
import { JamulusDigitalWorkstation } from '../lib/jamulus-server-stack';

test('Empty Stack', () => {
    const app = new App();
    // WHEN
    const stack = new JamulusDigitalWorkstation(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
