import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import "react-pdf/dist/Page/AnnotationLayer.css";
import { loadStripe } from '@stripe/stripe-js';
import "views/RiggsPDF.pdf";
import * as pdfjsLib from 'pdfjs-dist';
import './pdf.css';
import  CognitoAuth  from "cognito/index.js";

var myState = {
    pdf: null,
    currentPage: 1,
    zoom: 2
}

var amount = 0

var boughtPhysicalAmount = false

async function goToPage(num) {
    myState.currentPage = num
    document.getElementById("current_page").value = num
    render(myState)
    window.scrollTo(0, 0)
}

let arrayResultPages = []
let currentSearchPosition = 0

async function searchText() {

  arrayResultPages = []

  var searchText = document.getElementById("searchtext").value
  searchText.replace(/\s+/g, '');
  searchText = searchText.toLowerCase()

  var maxPages = myState.pdf._pdfInfo.numPages;
  console.log("pages summary " + maxPages)

  for (var i = 1; i <= maxPages; i++) {
  // for (var i = 1; i <= 10; i++) {
      var page = await myState.pdf.getPage(i);
      var textContent = await page.getTextContent();
      textContent = textContent.items.map(function (s) { return s.str; }).join('').toLowerCase(); // value page text
      if (textContent.includes(searchText)) {
        arrayResultPages.push(i)
      }
    }

  if (arrayResultPages.length === 0) {
    console.log("\""+searchText+"\"" + " is not found in the document")
  }
  else {
    console.log(arrayResultPages)
    let startPage = arrayResultPages[0]
    myState.currentPage = startPage
    document.getElementById("current_page").value = startPage
    render(myState)
  }
}

async function nextSearchResult() {
  if (currentSearchPosition < arrayResultPages.length-1) {
    currentSearchPosition = currentSearchPosition + 1;

    let loadPage = arrayResultPages[currentSearchPosition]
    myState.currentPage = loadPage
    document.getElementById("current_page").value = loadPage
    render(myState)
  }
}

async function prevSearchResult() {
  if (currentSearchPosition > 0) {
    currentSearchPosition = currentSearchPosition - 1;

    let loadPage = arrayResultPages[currentSearchPosition]
    myState.currentPage = loadPage
    document.getElementById("current_page").value = loadPage
    render(myState)
  }
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
    document.getElementById("pdf_renderer").remove();
    var container = document.getElementById("canvas_container");
    var canvas = document.createElement('canvas');
    var canvasStyle = {
    display: '0 auto',
          backgroundColor: '#FFFFFF',

    }
    canvas.id     = "pdf_renderer";
    canvas.style.position = 'relative'
    container.appendChild(canvas);
    canvas.addEventListener("mousemove", (e) => {document.body.style.cursor  = 'auto'}, false);

    var ctx = canvas.getContext('2d');

    myState.pdf.getPage(myState.currentPage).then((page) => {
        console.log(page._pageInfo.ref)
        var viewport = page.getViewport({scale:myState.zoom});
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        page.render({
            canvasContext: ctx,
            viewport: viewport,
        }).promise.then(() => {
            return page.getTextContent();
        }).then((textContent) => {
            const pdf_canvas = document.getElementById("pdf_renderer")
            const canvas_offset_top = pdf_canvas.offsetTop
            const canvas_offset_left = pdf_canvas.offsetLeft
            const canvas_height = pdf_canvas.height 
            const canvas_width = pdf_canvas.width
            document.getElementById("text-layer").setAttribute('style', `z-index: 99999!important; left: ${canvas_offset_left}px; top: ${canvas_offset_top}px; height: ${canvas_height}px; width: ${canvas_width}px`)
            pdfjsLib.renderTextLayer({
                textContent: textContent,
                container: document.getElementById("text-layer"),
                viewport: viewport,
                textDivs: []
            })
        });
        setupAnnotations(page, viewport, canvas, ctx, myState.zoom)
    });


}

  function setupAnnotations(page, viewport, canvas, ctx, zoom) {
    var canvasOffset = canvas.getBoundingClientRect();
    var promise = page.getAnnotations().then(function (annotationsData) {
      viewport = viewport.clone({
        dontFlip: true
      });
      for (var i = 0; i < annotationsData.length; i++) {
        var annotation = annotationsData[i];
        console.log('AREK', annotation)
        if (!annotation || !('Link' == annotation.subtype)) {
          continue;
        }

        drawHyperLink(canvas, ctx, annotation, zoom, page.view)

        var linkText = "Authorcode";
        var linkURL = "http://www.authorcode.com";
        var linkX = 50;
        var linkY = 25;
        var linkWidth;
        var isLink = true;


        function drawHyperLink(canvas, ctx, annotation, zoom, viewport) {
            // check if supported
            if (canvas.getContext) {
                ctx.font = 'px sans-serif';
                ctx.fillStyle = "#0000ff";
                ctx.fillText(linkText, linkX, linkY);
                linkWidth = ctx.measureText(linkText).width;
                //ctx.beginPath();
                //ctx.rect(annotation.rect[0], annotation.rect[1], annotation.rect[2] - annotation.rect[0], annotation.rect[3] - annotation.rect[1])
                //ctx.stroke();
                canvas.addEventListener("click", (e) => getCursorPosition(ctx.canvas, e, annotation.rect, annotation.url, zoom, viewport, annotation.dest), false);
                canvas.addEventListener("mousemove", (e) => setCursor(ctx.canvas, e, annotation.rect, annotation.url, zoom, viewport), false);
            }
        }

        function getCursorPosition(canvas, event, rectLink, url, zoom, viewport, dest) {
            const rect = canvas.getBoundingClientRect()
            const x = event.clientX - rect.left
            const y = event.clientY - rect.top
            var linkX, linkY, linkWidth, linkHeight;
            linkX = rectLink[0] * zoom
            linkHeight = (rectLink[3] - rectLink[1]) * zoom
            linkY = ((viewport[3] - rectLink[1])) * zoom - linkHeight
            linkWidth = (rectLink[2] - rectLink[0]) * zoom
            if (x >= linkX && x <= (linkX + linkWidth)
                    && y >= linkY && y <= (linkY + linkHeight)) {
                if(dest) {
                    console.log('AREK', dest[0])
                    goToRef(dest[0])
                }
                else {
                window.location = url; }
            }
        }

        function setCursor(canvas, event, rectLink, url, zoom, viewport) {
            const rect = canvas.getBoundingClientRect()
            const x = event.clientX - rect.left
            const y = event.clientY - rect.top
            var linkX, linkY, linkWidth, linkHeight;
            linkX = rectLink[0] * zoom
            linkHeight = (rectLink[3] - rectLink[1]) * zoom
            linkY = ((viewport[3] - rectLink[1])) * zoom - linkHeight
            linkWidth = (rectLink[2] - rectLink[0]) * zoom
            if (x >= linkX && x <= (linkX + linkWidth)
                    && y >= linkY && y <= (linkY + linkHeight)) {
                document.body.style.cursor = 'pointer'
            }
        }
      }
    });
    return promise;
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
        console.log('data', data)
        console.log('asdasd', data)
        let found = false
        if(data != 0){
            found = true
        }
        amount = data
        if(!found) {
          window.location = '/profile-page#/profile-page'
        } else {
          console.log()
          console.log(pdfjsLib.version)
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

          <div className="navigation_button_block">
            <div className="navigation_button">
              <div className="backToDashboard" id="backToDashboard-bttn">
                Back to Dashboard
              </div>
            </div>
          </div>

          <div className="navigation_button_block">
            <input id="current_page" className="toolbarField pageNumber" placeholder={1} type="number"/>
          </div>

          <div className="navigation_button_block">
            <div className="navigation_button">
              <div className="label">Previous Page</div>
              <div className="navIcon prevPage"></div>
            </div>

            <div className="navigation_button">
              <div className="label">Next Page</div>
              <div className="navIcon nextPage"></div>
            </div>

            <div className="navigation_button">
              <div className="label">Last Location</div>
              <div className="navIcon lastPage"></div>
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
          <canvas id="pdf_renderer"></canvas>
          <div id="text-layer"></div>
          <div id="preview-step-controller">
            <label for="cars">Choose range:</label>
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
