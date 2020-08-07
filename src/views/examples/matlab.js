import React from "react";

// reactstrap components
// import {
// } from "reactstrap";

// core components
import ExamplesNavbar from "components/Navbars/ExamplesNavbar.js";
import LandingPageHeader from "components/Headers/LandingPageHeader.js";
import DefaultFooter from "components/Footers/DefaultFooter.js";

import {
  Button,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  TabPane,
  Container,
  Row,
  Col
} from "reactstrap";

// sections for this page

function Matlab() {
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
    <div className="wrapper" >
      <div className="section section-about-us">
        <Container>
          <Row>
            <Col className="ml-auto mr-auto text-center" md="8">
              <h2 className="title">Programming with MATLAB for Engineers</h2>
              <h4 className="title">ISBN: 978-0-9669601-6-5</h4>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
    <TabPane tabId="pills2" style={{backgroundColor: "#FFFFFF"}}>
      <Col className="ml-auto mr-auto" md="8">
        <Row className="collections">
            <img
              alt="..."
              className="img-raised"
              href = "https://www.ferretpublish.com/programming-with-matlab-for-engineers.html"
              src={require("assets/img/matlab.jpg")}
            ></img>
          </Row>
          </Col>
    </TabPane>
    <Row style={{backgroundColor: "#FFFFFF"}}>
      <Col className="ml-auto mr-auto text-center" md="8">
         <h3 className="title">Key Features</h3>
       </Col>
      <Col className="ml-auto mr-auto text-center" md="8">
      <img
        alt="..."
        align = "center"
        href = "https://www.ferretpublish.com/chemical-and-bio-process-control.html"
        src={require("assets/img/matlabtext.png")}
      ></img>
      </Col>
    </Row>
      <Row style={{backgroundColor: "#FFFFFF"}}>
      <Col className="ml-auto mr-auto text-center" md="5">
      <h3 className="title">Table of Contents</h3>
      <img
        alt="..."
        align = "center"
        href = "https://www.ferretpublish.com/chemical-and-bio-process-control.html"
        src={require("assets/img/matlabtoc.png")}
      ></img>
      </Col>
    </Row>
      <Row style={{backgroundColor: "#FFFFFF"}}>
    <Col className="text-center ml-auto mr-auto" md = "2">
      <div className="send-button">
        <Button
          block
          className="btn-round"
          align-items="center"
          color="info"
          href="http://www.ferretpublish.com/"
          size="lg"
        >
          Purchase
        </Button>
      </div>
    </Col>
    </Row>
  </>
);
}

export default Matlab;
