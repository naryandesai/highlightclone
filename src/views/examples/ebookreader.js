import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import "react-pdf/dist/Page/AnnotationLayer.css";
import { loadStripe } from '@stripe/stripe-js';
import "views/RiggsPDF.pdf";
import * as pdfjsLib from 'pdfjs-dist';
import './pdf.css';
import './pdf_viewer.css';
import  CognitoAuth  from "cognito/index.js";
import * as pdfjsViewer from 'pdfjs-dist/web/pdf_viewer';
import { TextLayerBuilder } from "pdfjs-dist/lib/web/text_layer_builder";
import pdffile from "./test.pdf";

var myState = {
    pdf: null,
    currentPage: 1,
    zoom: 2,
    searchText: "",
    eventType: "",
    searchBtn: false,
    loaded: false
}
//phraseSearch
var container, eventBus, pdfLinkService, pdfFindController, pdfSinglePageViewer

setTimeout(() => {
  container = document.getElementById("canvas_container");
  if (container) {
    eventBus = new pdfjsViewer.EventBus();

      pdfLinkService = new pdfjsViewer.PDFLinkService({
        eventBus: eventBus,
      });

      pdfFindController = new pdfjsViewer.PDFFindController({
        eventBus: eventBus,
        linkService: pdfLinkService
      });

      pdfSinglePageViewer = new pdfjsViewer.PDFSinglePageViewer({
        container: container,
        eventBus: eventBus,
        linkService: pdfLinkService,
        findController: pdfFindController,
      });
      pdfLinkService.setViewer(pdfSinglePageViewer);  

      eventBus.on("pagesinit", function () {
        pdfSinglePageViewer.currentScaleValue = "1.5";
      });
  }
})


var amount = 0

var boughtPhysicalAmount = false

async function goToPage(num) {
    myState.currentPage = num
    document.getElementById("current_page").value = num
    document.getElementById("searchtext").value = ""
    myState.searchText = ""
    render(myState)
    window.scrollTo(0, 0)
}

let arrayResultPages = []
let currentSearchPosition = 0

async function searchText(btn) {

  arrayResultPages = []

  var searchText = document.getElementById("searchtext").value
  searchText.replace(/\s+/g, '');
  searchText = searchText.toLowerCase()
  myState.searchText = searchText
  if (searchText) {
    let options = {
      query: searchText,
      highlightAll: true
    }
    if (searchText.includes(" "))  
      options["phraseSearch"] = true
    if (btn == "prev")
      options["findPrevious"] = true
    pdfFindController.executeCommand("find" + myState.eventType, options);
  }
  render(myState)
}

async function nextSearchResult() {
    myState.searchBtn = true
    myState.eventType = "again"
    searchText("next")
}

async function prevSearchResult() {
    myState.searchBtn = true
    myState.eventType = "again"
    searchText("prev")
}

// old function, would be refactoring furtherly.
async function goToText() {
    var searchText = document.getElementById("searchtext").value
    searchText.replace(/\s+/g, '');
    var currentPage = myState.currentPage
    if(searchText) {
      console.log(searchText, currentPage)
    }
    searchText = searchText.toLowerCase()
    var maxPages = myState.pdf._pdfInfo.numPages;
    var countPromises = []; // collecting all page promises
    var pageNum = currentPage;
    for (var j = parseInt(currentPage) + 1; j <= maxPages; j++) {
      var page = await myState.pdf.getPage(j);

      var txt = "";
      var textContent = await page.getTextContent();
      textContent = textContent.items.map(function (s) { return s.str; }).join('').toLowerCase(); // value page text
      if (textContent.includes(searchText)) {
        // console.log(textContent)
        // console.log(searchText + " -----> " + j)
        pageNum = j;
        break;
      }
    }
    myState.currentPage = pageNum
    document.getElementById("current_page").value = pageNum
    render(myState)
}

async function goToRef(ref) {
    var maxPages = myState.pdf._pdfInfo.numPages;
    var currentPage = ref.num/5
    var pageNum = 1;
    for (var j = parseInt(currentPage) + 1; j <= maxPages; j++) {
      var page = await myState.pdf.getPage(j);

      var txt = "";
      var textContent = await page.getTextContent();
      var pageRef = page._pageInfo.ref
      console.log("AREK", pageRef, ref)
      if (pageRef.num == ref.num) {
        console.log("AREK Found ref on page " + j)
        pageNum = j;
        break;
      }
    }
    myState.currentPage = pageNum
    document.getElementById("current_page").value = pageNum
    render(myState)
}


function render(myState) {
    if (!myState.loaded) {
      myState.loaded = true
      var loadingTask = pdfjsLib.getDocument(pdffile);
      loadingTask.promise.then(function (pdfDocument) {
        pdfSinglePageViewer.setDocument(pdfDocument);
        pdfLinkService.setDocument(pdfDocument, null);
      })
    } else {
      console.log(myState.searchBtn, myState.searchText, myState.eventType, myState.currentPage)
      if (myState.searchText == "") {
        pdfSinglePageViewer.currentPageNumber = myState.currentPage
      } else {
        if (myState.searchBtn) {
          myState.searchBtn = false
        }
        document.getElementById("current_page").value = pdfSinglePageViewer.currentPageNumber
      }
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
    window.location = '/profile-page#/profile-page'
  }
}

function getAccessToken() {
  try {
    let user = (CognitoAuth.getCurrentUser())
    return  user.storage['CognitoIdentityServiceProvider.3v6khmrs69c87vlmcipjcloi0c.'+user.username+'.idToken']
  } catch (ex) {
    window.location = '/profile-page#/profile-page'
  }
}

function Studentreader() {
    CognitoAuth.isAuthenticated()

    let ebook = String(window.location).split('/').slice(-1)[0];
    let email = getEmail();
    fetch("https://8wrro7by93.execute-api.us-east-1.amazonaws.com/ferret/charge/"+email+"&"+ebook)
      .then( res => res.text() )
      .then( data =>  {
        let found = false
        if(data != 0){
            found = true
        }
        amount = data
        if(!found) {
          window.location = '/profile-page#/profile-page'
        } else {
          pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`

          function makeThumb(num, page) {
            // draw page to fit into 96x96 canvas
            var vp = page.getViewport({scale:myState.zoom});
            var canvas = document.createElement("canvas");
            canvas.width = canvas.height = 96;
            canvas.onclick = function() { goToPage(num); }
            var scale = Math.min(canvas.width / vp.width, canvas.height / vp.height);

            return page.render({canvasContext: canvas.getContext("2d"), viewport: page.getViewport({scale:scale})}).promise.then(function () {
              canvas.getContext("2d").font = "20px Arial";
              canvas.getContext("2d").fillText(String(num), 10, 20);
              return canvas;
            });
          }
          let access_token = ''
          try {
              access_token = getAccessToken()
          } catch(error) {
            window.location = '/profile-page#/profile-page'
          }
          fetch('https://8wrro7by93.execute-api.us-east-1.amazonaws.com/ferret/ebook/'+ebook)
              .then((resp) => resp.json())
              .then((resp) => {
                  console.log('ebook ', resp)
                  pdfjsLib.getDocument(resp.body).promise.then(async function (doc) {
                    var pages = []; while (pages.length < doc.numPages) {pages.push(pages.length + 1);
                      // create a div for each page and build a small canvas for it
                      let num = pages.length
                      // console.log(num)
                      var div = document.getElementById("preview");
                      let result = await doc.getPage(num).then((e) => makeThumb(num, e))
                        .then(function (canvas) {
                          div.appendChild(canvas);
                      });
                    }
                  }).catch(console.error);
                  const loadingTask = pdfjsLib.getDocument(resp.body);

                  loadingTask.promise.then(function(pdf) {
                      pdf.getOutline().then((outline) => {
                      console.log(outline)
                      });
                    console.log(pdf.getPageLabels().then(e=>console.log(e)))
                    var previewbarPosition = 1;
                    myState.pdf = pdf;
                      document.getElementById("backToDashboard-bttn")
                      .addEventListener('click', (e) => {
                        // window.location = '/profile-page#/profile-page'
                        window.location = '/#/profile-page'
                      });
                      document.getElementById('zoom_in')
                      .addEventListener('click', (e) => {
                          if(myState.pdf == null) return;
                          myState.zoom += 0.5;
                          console.log('ZOOM', myState.zoom)
                          render(myState);
                      });
                      document.getElementById('zoom_out')
                      .addEventListener('click', (e) => {
                          if(myState.pdf == null) return;
                          if(myState.zoom > 2)
                          myState.zoom -= 0.5;
                          console.log('ZOOM', myState.zoom)
                          render(myState);
                      });
                      // document.getElementById('go_previous')
                      document.getElementsByClassName('prevPage')[0]
                              .addEventListener('click', (e) => {
                                  if(myState.pdf == null
                                     || myState.currentPage == 1) return;
                                  myState.currentPage -= 1;
                                  myState.searchText = ""
                                  document.getElementById("searchtext").value = ""
                                  document.getElementById("current_page")
                                          .value = myState.currentPage;
                                  render(myState);
                              });
                      // document.getElementById('go_next')
                      document.getElementsByClassName('nextPage')[0]
                              .addEventListener('click', (e) => {
                                  if(myState.pdf == null
                                     || myState.currentPage > myState.pdf
                                                                     ._pdfInfo.numPages)
                                     return;
                                  myState.searchText = ""
                                  document.getElementById("searchtext").value = ""
                                  myState.currentPage += 1;
                                  document.getElementById("current_page")
                                          .value = myState.currentPage;
                                  render(myState);
                      });
                                    //
              document.getElementById('slide-left')
              .addEventListener('click', (e) => {
                console.log(document.getElementById('preview').style.width)
                if (previewbarPosition === 1) {

                }
                else {
                  previewbarPosition = previewbarPosition + 80;
                  document.getElementById('preview').style.marginLeft = previewbarPosition + 'px';
                }
            });
            document.getElementById('slide-right')
              .addEventListener('click', (e) => {
                // console.log("goto ")
                previewbarPosition = previewbarPosition - 80;
                document.getElementById('preview').style.marginLeft = previewbarPosition + 'px';
            });
            document.getElementById('range-control')
              .addEventListener('change', (e) => {
                console.log("goto " + e.target.value)
                switch (e.target.value) {
                  case "1":
                    previewbarPosition = 1;
                  break;
                  case "100":
                    previewbarPosition = -7999;
                  break;
                  case "200":
                    previewbarPosition = -15998;
                  break;
                  case "300":
                    previewbarPosition = -23997;
                    // previewbarPosition = -28797;
                  break;
                  case "400":
                    previewbarPosition = -31996;
                    // previewbarPosition = -38396;
                  break;
                  case "500":
                    previewbarPosition = -39995;
                  break;
                  case "600":
                    previewbarPosition = -47994;
                  break;

                  default:
                    console.log("something wrong with range-control switch and arg was: " + e.target.value)
                }
                document.getElementById('preview').style.marginLeft = previewbarPosition + 'px';
            });
                      document.getElementById('current_page')
                      .addEventListener('keypress', (e) => {
                          if(myState.pdf == null) return;

                          // Get key code
                          var code = (e.keyCode ? e.keyCode : e.which);

                          // If key code matches that of the Enter key
                          if(code == 13) {
                              var desiredPage =
                                      document.getElementById('current_page')
                                              .valueAsNumber;

                              if(desiredPage >= 1
                                 && desiredPage <= myState.pdf
                                                          ._pdfInfo.numPages) {
                                      myState.currentPage = desiredPage;
                                    myState.searchText = ""
                                    pdfFindController.executeCommand("find",{
                                      query: null
                                    })
                                    document.getElementById("searchtext").value = ""
                                      document.getElementById("current_page")
                                              .value = desiredPage;
                                      render(myState);
                              }
                          }
                      });
                    render(myState);
                  })
                  })


            }
          }).catch(() => window.location = "/profile-page#/profile-page")
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
    // more code here
    var canvasStyle = {
    display: '0 auto',
          backgroundColor: '#abeef7',
                verticalAlign: 'bottom',

          position: 'relative'

    }


    var style =  {
      verticalAlign: 'top',
      backgroundColor: '#2c2c2c',
      width: '100%',
      color: 'white',
      textAlign: 'center',
        position:'relative',
        width:'100%',
        minWidth:'315px'
    }

    var buttonsLeft = {
        position:'absolute',
        top:'0px',
        left:'0px',
        height:'40px',
        width:'400px',display: 'inline-block',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    }

    var buttonsRight = {
    position:'absolute',
    top:'0px',
    right:'0px',
    height:'40px',
    width:'350px',display: 'inline-block',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    }

    var buttonsCenter = {
    height:'40px',
    width:'200px',
    margin:'0px auto',display: 'inline-block',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    }
    return (
    <div id="my_pdf_viewer" >
        <div id="navigation_controls" style={style}>
        <div>
          </div>
          <div className="navigation_button_block">
            <div className="navigation_button">
              <div className="backToDashboard" id="backToDashboard-bttn">
                Back to Dashboard
              </div>
              <div className="backToDashboard" id="backToDashboard-bttn">
                Table of Contents
              </div>
            </div>
          </div>

          <div className="navigation_button_block">
            <input id="current_page" className="toolbarField pageNumber" placeholder={1} type="number"/>
          </div>

          <div className="navigation_button_block">
            <div className="navigation_button">
              <div className="label">Prev Page</div>
              <div className="navIcon prevPage"></div>
            </div>

            <div className="navigation_button">
              <div className="label">Next Page</div>
              <div className="navIcon nextPage"></div>
            </div>
          </div>

          <div className="navigation_button_block">
            <div className="navigation_button" id="zoom_in">
              <div className="label">Zoom In</div>
              <div className="navIcon zoomIn"></div>
            </div>

            <div className="navigation_button" id="zoom_out">
              <div className="label">Zoom Out</div>
              <div className="navIcon zoomOut"></div>
            </div>
          </div>

          <div className="navigation_button_block">
            <input id='searchtext' type="text" className="toolbarField" placeholder="Search"></input>
            {/* <div className="navigation_button searchBttn" onClick={goToText}>🔍</div> */}
            <div className="navigation_button searchBttn" onClick={searchText}>🔍</div>

            <div className="navigation_button searchBttn" onClick={prevSearchResult}>prev</div>
            <div className="navigation_button searchBttn" onClick={nextSearchResult}>next</div>

          </div>
        </div>

        <div id="canvas_container" style={canvasStyle}>
        <div id="viewer" className="pdfViewer"></div>
          <canvas id="pdf_renderer"></canvas>
          <div id="preview-step-controller">
            <label htmlFor="cars">Choose range:</label>
            <select name="preview-range" id="range-control">
              <option value="1">1-100</option>
              <option value="100">101-200</option>
              <option value="200">201-300</option>
              <option value="300">301-400</option>
              <option value="400">401-500</option>
              <option value="500">501-600</option>
            </select>
          </div>
        </div>

        <div className="preview-wrapper">
          <div id="preview"></div>
          <div id="slide-left"></div>
          <div id="slide-right"></div>
        </div>

      </div>
   );
}
export default Studentreader;
