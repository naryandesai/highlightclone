import React from "react";
import { Link } from "react-router-dom";
// reactstrap components
import {
  Collapse,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  NavbarBrand,
  Navbar,
  NavItem,
  NavLink,
  Nav,
  Container,
  UncontrolledTooltip
} from "reactstrap";
import  CognitoAuth  from "cognito/index.js";
function getName() {
  try {
    return (CognitoAuth.getCurrentUser().username)
  }
  catch(err) {
    return "login"
  }
}

function loggedIn() {
  try {
    var username = (CognitoAuth.getCurrentUser().username)
    console.log("logged in as " + username)
    return true
  }
  catch(err) {
    return false
  }
}

function logout() {
  CognitoAuth.logout()
  window.location = "/"
}
function ExamplesNavbar() {
  const [navbarColor, setNavbarColor] = React.useState("navbar-transparent");
  const [collapseOpen, setCollapseOpen] = React.useState(false);
  var usrname = (getName())
  if(loggedIn()) {
  var logoutButton = <NavLink id="tologin" onClick={e=>logout()} tag={Link}>
                Log Out
              </NavLink>
  } else {
    var logoutButton = <div></div>
  }
  console.log(logoutButton)
  React.useEffect(() => {
    const updateNavbarColor = () => {
      if (
        document.documentElement.scrollTop > 399 ||
        document.body.scrollTop > 399
      ) {
        setNavbarColor("");
      } else if (
        document.documentElement.scrollTop < 400 ||
        document.body.scrollTop < 400
      ) {
        setNavbarColor("navbar-transparent");
      }
    };
    window.addEventListener("scroll", updateNavbarColor);
    return function cleanup() {
      window.removeEventListener("scroll", updateNavbarColor);
    };
  });
  return (
    <>
      {collapseOpen ? (
        <div
          id="bodyClick"
          onClick={() => {
            document.documentElement.classList.toggle("nav-open");
            setCollapseOpen(false);
          }}
        />
      ) : null}
      <Navbar className={"fixed-top " + navbarColor} color="info" expand="lg">
        <Container>
          <UncontrolledDropdown className="button-dropdown">
          </UncontrolledDropdown>
          <div className="navbar-translate">
            <NavbarBrand
              href="https://www.ferretpublish.com"
              target="_blank"
              id="navbar-brand"
            >
              Ferret Publishing
            </NavbarBrand>
            <UncontrolledTooltip target="#navbar-brand">
              Designed by Symbiotica
            </UncontrolledTooltip>
            <button
              className="navbar-toggler navbar-toggler"
              onClick={() => {
                document.documentElement.classList.toggle("nav-open");
                setCollapseOpen(!collapseOpen);
              }}
              aria-expanded={collapseOpen}
              type="button"
            >
              <span className="navbar-toggler-bar top-bar"></span>
              <span className="navbar-toggler-bar middle-bar"></span>
              <span className="navbar-toggler-bar bottom-bar"></span>
            </button>
          </div>
          <Collapse
            className="justify-content-end"
            isOpen={collapseOpen}
            navbar
          >
            <Nav navbar>
            <NavItem>
              <NavLink href="/landing-page" >
                Home
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink id="tologin"  href={loggedIn() ? "/profile-page#/profile-page" : "/login-page#/login-page"} >
                  {loggedIn() ? "Profile page" : "Log in"}
              </NavLink>
              <div id="login" >
              </div>
            </NavItem>
            <NavItem>
            {logoutButton}
              <div id="login" >
              </div>
            </NavItem>
              <NavItem>
                <NavLink
                  href="https://www.facebook.com/"
                  target="_blank"
                  id="facebook-tooltip"
                >
                  <i className="fab fa-facebook-square"></i>
                  <p className="d-lg-none d-xl-none">Facebook</p>
                </NavLink>
                <UncontrolledTooltip target="#facebook-tooltip">
                  Like us on Facebook
                </UncontrolledTooltip>
              </NavItem>
              <NavItem>
                <NavLink

                  target="_blank"
                  id="instagram-tooltip"
                >
                  <a href="https://www.linkedin.com/">
                  <i className="fab fa-linkedin"></i>
                  <p className="d-lg-none d-xl-none">Linkedin</p>
                  </a>
                </NavLink>
                <UncontrolledTooltip target="#instagram-tooltip">
                  Follow us on LinkedIn
                </UncontrolledTooltip>
              </NavItem>
            </Nav>
          </Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default ExamplesNavbar;
