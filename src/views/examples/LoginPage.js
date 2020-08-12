import React from "react";

// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Container,
  Col
} from "reactstrap";
import  CognitoAuth  from "../../cognito/index.js";
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';

// core components
import ExamplesNavbar from "components/Navbars/ExamplesNavbar.js";
import TransparentFooter from "components/Footers/TransparentFooter.js";

function toRoot() {
  console.log("to root")
  window.location.href ="/"
}

function getEmail() {
  try {
  let user = (CognitoAuth.getCurrentUser())
  let email = '';
  let user_attributes = JSON.parse(user.storage['CognitoIdentityServiceProvider.3v6khmrs69c87vlmcipjcloi0c.'+user.username+'.userData'])['UserAttributes']
  for(var attribute in user_attributes) {
      console.log(user_attributes[attribute])
      if(user_attributes[attribute].Name == 'email') {
          email = user_attributes[attribute].Value
      }
  }
  return email
}

  catch(ex) {
    return 'dummy'
  }
}


function errorLog(e) {
  document.getElementById("errorMsg").innerHTML = JSON.stringify(e)

}

function signin() {
  var password = document.getElementById("password").value
  console.log(password)
  fetch('https://8wrro7by93.execute-api.us-east-1.amazonaws.com/ferret/lock/unlock&'+getEmail()+"&"+password+"&"+new Date().getTime())
  .then((res) => {

    if (res.status == 404){
      alert('Wrong unlock code!')
    } else {
      window.location = "profile-page#/profile-page"
    }
  })

  fetch('https://8wrro7by93.execute-api.us-east-1.amazonaws.com/ferret/uni/' + getEmail() +"&"+document.getElementById("uni").value,
    {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method: "POST"
  })
  .then((res) => {

    console.log(res)
  })

}

let ask_for_uni = false;

function LoginPage() {
    console.log(CognitoAuth)
  const [firstFocus, setFirstFocus] = React.useState(false);
  const [lastFocus, setLastFocus] = React.useState(false);
  React.useEffect(() => {
    document.body.classList.add("login-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    return function cleanup() {
      document.body.classList.remove("login-page");
      document.body.classList.remove("sidebar-collapse");
    };
  });
  fetch('https://8wrro7by93.execute-api.us-east-1.amazonaws.com/ferret/uni/' + getEmail())
  .then( res => res.json() )
  .then(res => {
    console.log('wtf')
    if(res) {
      document.getElementById("uni_form").style.display = "none";
      ask_for_uni = false
    } else {
      if(document.getElementById("uni").value) {
      document.getElementById("login_button").style.display = "block";

      }
      else {
      document.getElementById("login_button").style.display = "none";
      }
      ask_for_uni = true
    }
    console.log(ask_for_uni && !document.getElementById("uni").value)
  })
  return (
    <>
      <ExamplesNavbar />
      <div className="page-header clear-filter" filter-color="blue">
        <div
          className="page-header-image"
          style={{
            backgroundImage: "url(" + require("assets/img/loginpage.jpg") + ")"
          }}
        ></div>
        <div className="content">
          <Container>
            <Col className="ml-auto mr-auto" md="4">
              <Card className="card-login card-plain">
                <Form action="" className="form" method="">
                  <CardHeader className="text-center">
                    <div className="logo-container">
                      <img
                        alt="..."
                        src={require("assets/img/ferreticon.png")}
                      ></img>
                    </div>
                  </CardHeader>
                  <CardBody id="uni_form">
                    <InputGroup
                      className={
                        "no-border input-lg" +
                        (lastFocus ? " input-group-focus" : "")
                      }
                    >
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="now-ui-icons business_bank">
                          </i>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input
                        placeholder="Please tell us which university are you from"
                        type="uni"
                        id="uni"
                        onFocus={() => setLastFocus(true)}
                        onBlur={() => setLastFocus(false)}
                      ></Input>
                    </InputGroup>
                  </CardBody>
                  <CardBody>
                    <InputGroup
                      className={
                        "no-border input-lg" +
                        (lastFocus ? " input-group-focus" : "")
                      }
                    >
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="now-ui-icons objects_key-25"></i>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input
                        placeholder="Email code..."
                        type="password"
                        id="password"
                        onFocus={() => setLastFocus(true)}
                        onBlur={() => setLastFocus(false)}
                      ></Input>
                    </InputGroup>
                  </CardBody>
                  <CardFooter className="text-center">
                    <Button
                      block
                      className="btn-round"
                      color="info"
                      id = "login_button"
                      onClick={e => signin()}
                      size="lg"
                    >
                      Login
                    </Button>
                    <div className="pull-right">
                      <h6>
                        <a
                          className="link"
                          onClick={e => fetch('https://8wrro7by93.execute-api.us-east-1.amazonaws.com/ferret/lock/lock&'+getEmail())}
                        >
                          Resend email
                        </a>
                      </h6>
                    </div>
                  </CardFooter>
                </Form>
              </Card>
            </Col>
          </Container>
        </div>
      </div>
    </>
  );
}

export default withAuthenticator(LoginPage, true);
