import React from "react";

// reactstrap components
import {
  Button,
  NavItem,
  NavLink,
  Nav,
  TabContent,
  TabPane,
  Container,
  Row,
  Col,
  UncontrolledTooltip
} from "reactstrap";
import  CognitoAuth  from "cognito/index.js";
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { Hub, Logger } from 'aws-amplify';
// core components
import ExamplesNavbar from "components/Navbars/ExamplesNavbar.js";
import ProfilePageHeader from "components/Headers/ProfilePageHeader.js";
import DefaultFooter from "components/Footers/DefaultFooter.js";
function goToLogin(err, authenticated) {
  if(!authenticated)
  window.location = "/";
}

function getEmail(payload) {
  try {
  let email = '';
  console.log('payload ', payload)
  let user_attributes = JSON.parse(payload.storage['CognitoIdentityServiceProvider.3v6khmrs69c87vlmcipjcloi0c.'+payload.username+'.userData'])['UserAttributes']
    for(var attribute in user_attributes) {
        console.log(user_attributes[attribute])
        if(user_attributes[attribute].Name == 'email') {
            email = user_attributes[attribute].Value
        }
    }
    return email
  }

  catch(ex) {
    console.log(ex)
    return 'dummy'
  }
}

const logger = new Logger('My-Logger');

const listener = (data) => {

    switch (data.payload.event) {

        case 'signIn':
            alert("Confirm you account with code sent to your email inbox! - " + getEmail(data.payload.data))
            console.log(data.payload.data)
            let email = getEmail(data.payload.data)
            fetch('https://8wrro7by93.execute-api.us-east-1.amazonaws.com/ferret/lock/lock&'+email)
            logger.error('user signed in'); //[ERROR] My-Logger - user signed in
            break;
        case 'signUp':
            alert("Confirm you account with link sent to your email inbox! - " + getEmail(data.payload.data))
            logger.error('user signed up');
            window.location='/'
            break;
        case 'signOut':
            logger.error('user signed out');
            break;
        case 'signIn_failure':
            console.log(data.payload.data.message)
            if(data.payload.data.message.includes("SMS") ) {
              alert("Unauthorized access detected! Either you are accessing the site from new device or completely different ip/region. Reset account to be able to access it again.")
            }
            logger.error('user sign in failed');
            break;
        case 'configured':
            logger.error('the Auth module is configured');

    }
}

Hub.listen('auth', listener);


function ProfilePage() {
  const [pills, setPills] = React.useState("2");
  CognitoAuth.isAuthenticated()

  if(window.location.href.indexOf('email') > -1) {
    let user = (CognitoAuth.getCurrentUser())
    let email =''
    let user_attributes = JSON.parse(user.storage['CognitoIdentityServiceProvider.3v6khmrs69c87vlmcipjcloi0c.'+user.username+'.userData'])['UserAttributes']
    for(var attribute in user_attributes) {
        console.log(user_attributes[attribute])
        if(user_attributes[attribute].Name == 'email') {
            email = user_attributes[attribute].Value
        }
    }
    let access_token = user.storage['CognitoIdentityServiceProvider.3v6khmrs69c87vlmcipjcloi0c.'+user.username+'.idToken']
    console.log('access_token ', access_token)
    fetch('https://8wrro7by93.execute-api.us-east-1.amazonaws.com/ferret/email/'+email, {
        headers: {
          Authorization: access_token
        }
    })
  }
  React.useEffect(() => {
    document.body.classList.add("profile-page");
    document.body.classList.add("sidebar-collapse");

    document.documentElement.classList.remove("nav-open");
    return function cleanup() {
      document.body.classList.remove("profile-page");
      document.body.classList.remove("sidebar-collapse");
    };
  });
  return (
    <>
      <ExamplesNavbar />
      <div className="wrapper">
        <ProfilePageHeader />
        <div className="section">
          <Container>
            <div className="button-container">
              <Button
                className="btn-round btn-icon"
                color="default"
                id="tooltip515203352"
                size="lg"
              >
                <i className="fab fa-facebook"></i>
              </Button>
              <UncontrolledTooltip delay={0} target="tooltip515203352">
                Add me on Facebook
              </UncontrolledTooltip>
              <Button
                className="btn-round btn-icon"
                color="default"
                id="tooltip340339231"
                size="lg"
              >
                <i className="fab fa-linkedin"></i>
              </Button>
              <UncontrolledTooltip delay={0} target="tooltip340339231">
                Connect with me on LinkedIn
              </UncontrolledTooltip>
            </div>
            <Row>
              <Col className="ml-auto mr-auto" md="6">
                <h4 className="title text-center">My Textbooks</h4>
                <div className="nav-align-center">
                </div>
              </Col>
              <TabContent className="gallery" activeTab={"pills" + pills}>
                <TabPane tabId="pills1">
                  <Col className="ml-auto mr-auto" md="10">
                  </Col>
                </TabPane>
                <TabPane tabId="pills2">
                  <Col className="ml-auto mr-auto" md="10">
                    <Row className="collections">
                      <Col md="6">
                        <img
                          alt="..."
                          className="img-raised"
                          src={require("assets/img/freshman.jpg")}
                        ></img>
                        <a href='pdf-file#/pdf-file/Chemical and Bio-Process Control'>
                        <img
                          alt="..."
                          className="img-raised"
                          src={require("assets/img/process.jpg")}
                        ></img>
                        </a>
                        <a href='pdf-file#/pdf-file/Computational Methods for Chemical Engineers'>
                        <img
                          alt="..."
                          className="img-raised"
                          src={require("assets/img/cover.png")}
                        ></img>
                        </a>
                      </Col>
                      <Col md="6">
                        <img
                          alt="..."
                          className="img-raised"
                          src={require("assets/img/matlab.jpg")}
                        ></img>
                        <a href='pdf-file#/pdf-file/Computational Methods for Engineers with MATLAB Applications'>
                        <img
                          alt="..."
                          className="img-raised"
                          src={require("assets/img/comp.jpg")}
                        ></img>
                        </a>
                      </Col>
                    </Row>
                  </Col>
                </TabPane>
                <TabPane tabId="pills3">
                  <Col className="ml-auto mr-auto" md="10">
                    <Row className="collections">
                      <Col md="6">
                        <img
                          alt="..."
                          className="img-raised"
                          src={require("assets/img/bg3.jpg")}
                        ></img>
                        <img
                          alt="..."
                          className="img-raised"
                          src={require("assets/img/bg8.jpg")}
                        ></img>
                      </Col>
                      <Col md="6">
                        <img
                          alt="..."
                          className="img-raised"
                          src={require("assets/img/bg7.jpg")}
                        ></img>
                        <img
                          alt="..."
                          className="img-raised"
                          src={require("assets/img/bg6.jpg")}
                        ></img>
                      </Col>
                    </Row>
                  </Col>
                </TabPane>
              </TabContent>
            </Row>
          </Container>
        </div>
        <DefaultFooter />
      </div>
    </>
  );
}

export default withAuthenticator(ProfilePage, true);




