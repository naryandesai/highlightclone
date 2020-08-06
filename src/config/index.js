import Amplify from 'aws-amplify';

export default {
  region: "us-east-1",

  IdentityPoolId: "us-east-1_cogwvxoI0",
  UserPoolId: "us-east-1:083124225867",
  ClientId: "3v6khmrs69c87vlmcipjcloi0c"
};

const awsmobile = {
  Auth: {
    // Amazon Cognito Region
    region: "us-east-1",

    // Amazon Cognito User Pool ID
    userPoolId: "us-east-1_cogwvxoI0",

    // Amazon Cognito Web Client ID (26-char alphanumeric string)
    userPoolWebClientId: "3v6khmrs69c87vlmcipjcloi0c"
  }
};


Amplify.configure(awsmobile);
