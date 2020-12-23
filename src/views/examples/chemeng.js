import React from "react";
import { loadStripe } from '@stripe/stripe-js';

// reactstrap components
// import {
// } from "reactstrap";

// core components
import ExamplesNavbar from "components/Navbars/ExamplesNavbar.js";
import LandingPageHeader from "components/Headers/LandingPageHeader.js";
import DefaultFooter from "components/Footers/DefaultFooter.js";
import  CognitoAuth  from "cognito/index.js";

import {
  Button,
  Card,
  CardBody,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  TabPane,
  Container,
  Row,
  Col
} from "reactstrap";

let amount = 0;


function startPurchase(amount, send_email, book) {
  try {
  let access_token = getAccessToken()
  let email = getEmail();
  if(email == 'dummy') {
    window.location = 'profile-page#/profile-page'
  }
  console.log('access_token ', access_token)
  fetch('https://8wrro7by93.execute-api.us-east-1.amazonaws.com/ferret/session/'+String(amount)+'&' + email+'&'+book+'&'+send_email+'&'+new Date().getTime()).then((session) => {
      console.log("stripe response ", session)
      return session.json()}).then((session) => {
      console.log("stripe response ", session)
      const stripePromise = loadStripe(process.env.REACT_APP_CHECKOUT_KEY)
      .then((stripe) => {

          console.log('requesting stripe redirect', session)
          try {
            if(session.includes("Confirmation email sent")) {
              alert("Book code redeemed! Reloading page.")
              window.location.reload()
              return;
            }
          }
          catch(err) {}
          let sessionId = session.id
          const { error } = stripe.redirectToCheckout({
            sessionId,
          }).catch((error) =>
          {console.log(error);})}).catch((error) =>
          {console.log(error);alert('Coupon code not recognized or user not logged in.');});
      }).catch(console.log)
    } catch(err) {
      window.location='/profile-page#/profile-page'
    }

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

function getAccessToken() {
  try {
    let user = (CognitoAuth.getCurrentUser())
    return  user.storage['CognitoIdentityServiceProvider.3v6khmrs69c87vlmcipjcloi0c.'+user.username+'.idToken']
  } catch (ex) {
    window.location = 'dummy'
  }
}

// sections for this page

function Chemeng() {
  const [firstFocus, setFirstFocus] = React.useState(false);
  const [lastFocus, setLastFocus] = React.useState(false);
  React.useEffect(() => {
    document.body.classList.add("landing-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    return function cleanup() {
      document.body.classList.remove("landing-page");
      document.body.classList.remove("sidebar-collapse");
    };
  });
  try{
    try {
      let email = getEmail()
        fetch("https://8wrro7by93.execute-api.us-east-1.amazonaws.com/ferret/charge/"+email+"&Computational Methods for Chemical Engineers"+"&"+new Date().getTime())
        .then( res => res.text() )
        .then( data =>  {
          console.log(data)
              console.log('data', data)
              let found = false
              console.log(data)
              if(data != 0){
                  found = true
              }
              console.log('charge ', found)
              document.getElementById("read").style.display = "none";
              document.getElementById("purchase").style.display = "none";
              document.getElementById("bundle").style.display = "none";
              if(data == 0) {
                  document.getElementById("read").style.display = "none";
                  document.getElementById("purchase").style.display = "block";
                  document.getElementById("bundle").style.display = "block";
              }
              if(data != 0) {
                  document.getElementById("read").style.display = "block";
                  document.getElementById("purchase").style.display = "none";
                  document.getElementById("bundle").style.display = "none";
                  document.getElementById("coupon").style.display = "none";
                  document.getElementById("couponbutton").style.display = "none";
              }

                })
      } catch (err) {
        console.log(err)
      }
    } catch (err) {
      window.location='/login-page'
    }
  return (
    <>
    <div style={{backgroundColor: "#FFFFFF"}}>
    <ExamplesNavbar />
    <div className="wrapper" style={{backgroundColor: "#FFFFFF"}}>
      <div className="section section-about-us">
        <Container>
          <Row>
            <Col className="ml-auto mr-auto text-center" md="8">
              <h2 className="title">Computational Methods
for Chemical Engineers</h2>
              <h4 className="title">ISBN: 0-9669602-2-8</h4>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
    <TabPane tabId="pills2">
      <Col className="ml-auto mr-auto text-center" md="7">
        <Row className="collections">
            <img
              alt="..."
              className="img-raised"
              href = "https://www.ferretpublish.com/computational-methods-for-chemical-engineers.html"
              src={require("assets/img/cover.png")}
            ></img>
          </Row>
          </Col>
    </TabPane>
    <Row>
    <Col className="text-center ml-auto mr-auto" md = "2">
      <div className="send-button">
        <Button
          block
          id="purchase"
          className="btn-round"
          align-items="center"
          onClick={() => startPurchase(7900, false, 'Computational Methods for Chemical Engineers')}
          color="info"
          size="lg"
        >
          Purchase online edition for $79
        </Button>
        <Button
          block
          id='read'
          style ={{display:'none'}}
          className="btn-round"
          align-items="center"
          onClick={ () => startPurchase(4000, true, 'Computational Methods for Chemical Engineers') }
          color="info"
          size="lg"
        >
          Buy extra physical edition for $40
        </Button>
        <Button
          block
          id='bundle'
          style ={{display:'block'}}
          className="btn-round"
          align-items="center"
          onClick={ () => startPurchase(11900, true, 'Computational Methods for Chemical Engineers')  }
          color="info"
          size="lg"
        >
          Purchase online and physical edition for $119
        </Button>
        <Input id="coupon" placeholder="coupon code">
        </Input>
        <Button
          block
          id='couponbutton'
          className="btn-round"
          align-items="center"
          onClick={ () => startPurchase(document.getElementById("coupon").value, true, 'Computational Methods for Chemical Engineers') }
          color="info"
          size="lg"
        >
          Redeem using coupon code
        </Button>
      </div>
    </Col>
    </Row>
    <Row>
      <Col className="ml-auto mr-auto text-center" md="8">
        <h4 className="title">USE THE SAME EMAIL FOR LOGGING IN AND PURCHASING. OTHERWISE, YOU WILL NOT BE ABLE TO ACCESS THE E-BOOK!</h4>
      </Col>

    </Row>
    <Row>
    <Col className="ml-auto mr-auto text-center" md="5">
    <h3 className="title">Table of Contents</h3>
    <img
      alt="..."
      align = "center"
      href = "https://www.ferretpublish.com/chemical-and-bio-process-control.html"
      src={require("assets/img/tc1.png")}
    ></img>
    <img
      alt="..."
      align = "center"
      href = "https://www.ferretpublish.com/chemical-and-bio-process-control.html"
      src={require("assets/img/tc2.png")}
    ></img>
    </Col>
  </Row>

    </div>
  </>
);
}

export default Chemeng;
