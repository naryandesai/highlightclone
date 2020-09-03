import React from "react";
import { Link } from "react-router-dom";

// reactstrap components
import {
  Button,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Container,
  TabPane,
  Row,
  Col
} from "reactstrap";
import  CognitoAuth  from "cognito/index.js";

// core components
import ExamplesNavbar from "components/Navbars/ExamplesNavbar.js";
import LandingPageHeader from "components/Headers/LandingPageHeader.js";
import DefaultFooter from "components/Footers/DefaultFooter.js";
function LandingPage() {
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
  return (
    <>
      <ExamplesNavbar />
      <div className="wrapper">
        <LandingPageHeader />
        <div className="section section-about-us">
          <Container>
            <Row>
              <Col className="ml-auto mr-auto text-center" md="8">
                <h2 className="title">What We Offer</h2>
                <h5 className="description">
                  Industrially relevant engineering textbooks that make learning easier using lots of worked out examples and simple to understand text.
                </h5>
                <a href="https://fptextbook.s3.amazonaws.com/Ordering+Instructions.PNG">
                  Click here for ordering instructions.
                </a>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
      <TabPane tabId="pills2">
        <Col className="ml-auto mr-auto" md="10">
          <Row className="collections">
            <Col md="6">
            <Link to = "/bio"><img
              alt="..."
              className="img-raised"
              src={require("assets/img/process.jpg")}
            ></img></Link>
            <span>&nbsp;&nbsp;</span>
            <Link to = "/freshman"><img
              alt="..."
              className="img-raised"
              href = "https://www.ferretpublish.com/an-introduction-to-engineering-fundamentals.html"
              src={require("assets/img/freshman.jpg")}
            ></img></Link>
          </Col>
          <Col md="6">
            <Link to = "/matlab"><img
              alt="..."
              className="img-raised"
              src={require("assets/img/matlab.jpg")}
            ></img></Link>
            <span>&nbsp;&nbsp;</span>
            <Link to = "/comp"><img
              alt="..."
              className="img-raised"
              src={require("assets/img/comp.jpg")}
            ></img></Link>
            </Col>
          </Row>
        </Col>
      </TabPane>
    </>
  );
}

export default LandingPage;
