/*

=========================================================
* Now UI Kit React - v1.0.0
=========================================================

* Product Page: https://www.creative-tim.com/product/now-ui-kit-react
* Copyright 2019 Creative Tim (http://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/now-ui-kit-react/blob/master/LICENSE.md)

* Designed by www.invisionapp.com Coded by www.creative-tim.com

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";

// styles for this kit
import "assets/css/bootstrap.min.css";
import "assets/scss/now-ui-kit.scss";
import "assets/demo/demo.css";
import "assets/demo/nucleo-icons-page-styles.css";
// pages for this kit
import Index from "views/Index.js";
import NucleoIcons from "views/NucleoIcons.js";
import LoginPage from "views/examples/LoginPage.js";
import LandingPage from "views/examples/LandingPage.js";
import ProfilePage from "views/examples/ProfilePage.js";
import Freshman from "views/examples/freshman.js";
import Matlab from "views/examples/matlab.js";
import Comp from "views/examples/comp.js";
import Bioprocess from "views/examples/bio.js";
import Studentreader from "views/examples/ebookreader.js";
import Chemeng from "views/examples/chemeng.js";
import SignUp from "views/index-sections/SignUp.js";
import Python from "views/examples/python.js";

ReactDOM.render(
  <HashRouter>
    <Switch>
      <Switch>
        <Route
          path="/pdf-file"
          render={props => <Studentreader {...props} />}
        />
        <Route path="/index" render={props => <Index {...props} />} />
        <Route
          path="/nucleo-icons"
          render={props => <NucleoIcons {...props} />}
        />
        <Route
          path="/landing-page"
          render={props => <LandingPage {...props} />}
        />
        <Route
          path="/freshman"
          render={props => <Freshman {...props} />}
        />
        <Route
          path="/matlab"
          render={props => <Matlab {...props} />}
        />
        <Route
          path="/comp"
          render={props => <Comp {...props} />}
        />
        <Route
          path="/bio"
          render={props => <Bioprocess {...props} />}
        />
        <Route
          path="/chemeng"
          render={props => <Chemeng {...props} />}
        />
        <Route
          path="/python"
          render={props => <Python {...props} />}
        />
        <Route
          path="/profile-page"
          render={props => <ProfilePage {...props} />}
        />
        <Route path="/login-page" render={props => <LoginPage {...props} />} />
        <Route path="/sign-up-page" render={props => <SignUp {...props} />} />

        <Redirect to="/index" />
        <Redirect from="/" to="/login-page" />
      </Switch>
    </Switch>
  </HashRouter>,
  document.getElementById("root")
);
