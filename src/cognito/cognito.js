import { Config, CognitoIdentityCredentials } from "aws-sdk";
import {
  CognitoUser,
  CognitoUserPool,
  AuthenticationDetails,
  CognitoUserAttribute
} from "amazon-cognito-identity-js";

export default class CognitoAuth {
    constructor(config) {
    this.userSession = null;
    this.configure(config)
    }
    isAuthenticated (cb) {
        let cognitoUser = this.getCurrentUser()
        console.log(cognitoUser)
        if (cognitoUser != null) {
            return cb(null, true)
        } else {
            cb(null, false)
        }
    }

    configure (config) {
        if (typeof config !== 'object' || Array.isArray(config)) {
            throw new Error('[CognitoAuth error] valid option object required')
        }
        this.userPool = new CognitoUserPool({
            UserPoolId: config.IdentityPoolId,
            ClientId: config.ClientId
        })
        Config.region = config.region
        Config.credentials = new CognitoIdentityCredentials({
            IdentityPoolId: config.IdentityPoolId
        })
        this.options = config
    }
    signup(username, email, pass, cb) {
        let attributeList = [
            new CognitoUserAttribute({
                Name: 'email',
                Value: email
            })
        ]

        this.userPool.signUp(username, pass, attributeList, null, cb)
    }
    authenticate (username, pass, cb, failcb) {

        let authenticationData = { Username: username, Password: pass }
        let authenticationDetails = new AuthenticationDetails(authenticationData)
        let userData = { Username: username, Pool: this.userPool }
        let cognitoUser = new CognitoUser(userData)

        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                console.log('access token + ' + result.getAccessToken().getJwtToken())
                cb(result)
            },
            onFailure: function (err) {
                failcb(err);
            },
            newPasswordRequired: function (userAttributes, requiredAttributes) {
                console.log('New Password Is Required')
            }
        })
    }
    getCurrentUser () {
        return this.userPool.getCurrentUser()
    }

    confirmRegistration (username, code, cb) {
        let cognitoUser = new CognitoUser({
            Username: username,
            Pool: this.userPool
        })
        cognitoUser.confirmRegistration(code, true, cb)
    }

    /**
      * Logout of your cognito session.
      */
    logout () {
        this.getCurrentUser().signOut()
    }

    /**
    * Resolves the current token based on a user session. If there
    * is no session it returns null.
    * @param {*} cb callback
    */
    getIdToken (cb) {
        if (this.getCurrentUser() == null) {
            return cb(null, null)
        }
        this.getCurrentUser().getSession((err, session) => {
            if (err) return cb(err)
            if (session.isValid()) {
            return cb(null, session.getIdToken().getJwtToken())
            }
            cb(Error('Session is invalid'))
        })
    }
}