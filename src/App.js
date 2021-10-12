import React, { useState } from "react";
import Axios from "axios";
import "./index.css";
import { useEffect } from "react/cjs/react.development";

/*** Retreive XML File */
function getXML() {
  let url = "https://codetogo.io/api/users.xml";
  fetch(url)
    .then(response => response.text())
    .then(data => {
      //console.log(data);  //string
      let parser = new DOMParser();
      let xml = parser.parseFromString(data, "application/xml");
      document.getElementById('output').textContent = data;
      console.log(xml);

      //read xml
      xmlData(xml)

      //process xml
      processFile(xml)

    });

}

/*** Example of how to display values of xml from response */
function xmlData(xml) {
  document.getElementById('users').textContent= '';

  let list = document.getElementById('users');
  let users = xml.getElementsByTagName("user");

  for (let i = 0; i < users.length; i++) {
    let user = users[i];
    let names = user.getElementsByTagName("name");

    let li = document.createElement('li');

    for (let j = 0; j < names.length; j++) {
      //alert(names[j].childNodes[0].nodeValue);
      li.textContent = names[j].childNodes[0].nodeValue;
      list.appendChild(li);
    }
  }
}

/*** Example of how to send new xml to specific endpoint */
function sendXML(xml, name) {
  const xhttp = new XMLHttpRequest();
  let endpoint = '';
  xhttp.open("POST", endpoint);
  xhttp.onreadystatechange = () => {
    if (xhttp.readyState === 4 && xhttp.status === 200) {
      const res = xhttp.response;
      alert(`${res}: ${name}`);
    }
  };
  xhttp.setRequestHeader("Content-Type", "text/xml");
  xhttp.send(xml);

}

/*** Example of how to process file, adding new values to existin xml from response */
function processFile(data) {
  var chat = data.createElement("user");

  var user = data.createElement("id");
  user.appendChild(data.createTextNode("1"));

  var content = data.createElement("name");
  content.appendChild(data.createTextNode("Karla"));

  var timezone = data.createElement("date");
  let time = new Date().toISOString();
  timezone.appendChild(data.createTextNode(time));

  chat.appendChild(user);
  chat.appendChild(content);
  chat.appendChild(timezone);

  data.getElementsByTagName("users")[0].appendChild(chat);

  console.log(data); //check the updated new XML
  sendXML(data, 'newXML');

  // showing updated users
  let newUsers = data.getElementsByTagName("users")[0];
  let xmlText = new XMLSerializer().serializeToString(newUsers)
  document.getElementById('output-2').textContent = xmlText;

 
}


/** Internal function to generate server links */
function generateUrl() {
  const delay = Math.floor(Math.random() * 3);
  return `https://httpbin.org/delay/${delay}?delay=${delay}`;
}
/**
 * server links to test
 * @example
 *  ['https://httpbin.org/get', 'https://jsonplaceholder.typicode.com/todos/1', 'https://bad-url-abc-1234.gov']
 * @returns {string[]} Array of URLs
 */
const getServerUrls = () => [generateUrl(), generateUrl(), generateUrl()];
/**
 * Function to test the url
 * @param {string} url URL to test
 * @returns {boolean} True if server alive and false if dead
 */
async function testUrl(url) {
  try {
    console.log("testing: " + url);
    await Axios.get(url, {
      timeout: 1900
    });
    console.log("%cpass: " + url, "color: green");
    return true;
  } catch (_exception) {
    console.log("%cfail: " + url, "color: red");
    // console.log(exception);
    return false;
  }
}

/** Component that performs health check from getServerUrls() */
function HealthCheckerRefractored({ urls }) {
  //states
  const [listOfUrls, setListOfUrls] = useState(urls);
  const [isCompleted, setIsCompleted] = useState([]);
  const [autoCheck, setAutoCheck] = useState(false);
  //setTimer
  let time = null;

  useEffect(() => {
    // autocheck will execute only if autcheck is true
    if (autoCheck) autoCheckOnSync()
    if (!autoCheck) { clearTimeout(time) };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoCheck, isCompleted])

  /**
  * 
  * @param {*} url 
  * @param {*} index 
  * @returns boolean
  * @description Run specific url to test and update the state to populate UI.
  */
  async function runTestUrl(url, index) {
    let onpress = listOfUrls.map((v, i) => { if (i === index) v.btnOnPress = 'active'; return v })
    setListOfUrls(onpress)

    const statusResponse = await testUrl(url);

    let updated = listOfUrls.map((value, i) => {
      if (value.url === url && index === i) {
        value.test = statusResponse ? 'pass' : 'fail';
        value.textColor = statusResponse ? 'pass' : 'fail';
        value.btnOnPress = '';
        value.isCompleted = true
      }
      return value
    })
    setListOfUrls(updated);
    //console.log(updated)
    return updated[index].isCompleted ? 'completed' : 'untested'
  }

  /**
* Fetch new generated urls and set to state.
*/
  function getResetNewUrls() {
    setListOfUrls(getServerUrls().map((url) => { return { url: url, test: 'untested', textColor: '', btnOnPress: '' } }));
  }

  /**
 * 
 * @returns array
 * @description Run auto check for all the url in the array syncronized with response
 * and set state for all submitions completed.
 */
  async function autoCheckOnSync() {
    window.clearTimeout(time);
    if (!autoCheck) return;

    //reset values to be test check 
    setListOfUrls(listOfUrls.map((url) => { return { url: url.url, test: 'untested', textColor: '', btnOnPress: '' } }));
    let completed = [];

    //console.log(autoCheck)

    for (let i = 0; i < listOfUrls.length; i++) {
      await runTestUrl(listOfUrls[i].url, i).then((res) => {
        completed.push(res)
      })
    }


    console.log('All test are done, syste will re-test every 5 seconds:', completed)
    if (completed.length === listOfUrls.length) {

      time = setTimeout(() => {
        setIsCompleted(completed)
      }, 5000)
    }
    return completed

  }

  return (
    <div>
      <h3>Health Checker Component</h3>
      <button onClick={() => getResetNewUrls()}>Get New URLs</button>
      <button className={autoCheck ? 'active' : ''} onClick={(e) => setAutoCheck(!autoCheck)}>Auto-check</button>
      <ul>
        {
          listOfUrls.map((url, i) => {
            return (
              <li key={i}>
                {`server ${i} :  ${url.url}`}
                <button className={url.btnOnPress} onClick={(e) => runTestUrl(url.url, i)}>test</button>
                <br />
                <br />
                <span className={url.textColor}>{url.test}</span>
                <br />
                <br />
              </li>
            )
          })
        }
      </ul>
    </div>
  );
}

/** App component will render show button to start the health checker */
export default function App() {
  /***state */
  const [toggle, setToggle] = useState(false);

  //set list of items array
  const [listOfUrls] = useState(getServerUrls().map((url) => { return { url: url, test: 'untested', textColor: '', btnOnPress: '' } }));


  return (
    <div className="App">
      <h2>Server Health Check Page</h2>
      <hr />
      <button onClick={(e) => setToggle(!toggle)}>Show Health Checker</button>
      {toggle
        ?
        <HealthCheckerRefractored urls={listOfUrls} />
        : (false)}
      <br />
      <br />
      <br />
      <hr />
      <h3>Requirements</h3>
      <h4>Part 1:</h4>
      Suppose we have an array of URLs that needs to be tested. You are asked to
      build a reusable component that can display the list of URLs, their status
      and show buttons that can be used to test the URLs.
      <p>
        A) Update the code so when the “Show Health Checker” button is pressed:
      </p>
      <ol>
        <li>We show/hide the "HealthChecker" component</li>
        <li>
          Update "HealthChecker" component so it would call the getServerUrls()
          function to get a list of URLS
        </li>
        <li>
          Update the component to display each URL with its own test button
          instead of the text "LIST THE LINKS WITH TEST BUTTONS HERE". Show the
          "untested" status text underneath.
        </li>
      </ol>
      B) Update your code so that when a Test button is pressed you would:
      <ol>
        <li>Call testUrl to perform the test for each URL</li>
        <li>
          Change the color of the button before calling testUrl to indicate it’s
          being tested
        </li>
        <li>
          Show the result underneath the URL as such:
          <ul>
            <li>If testUrl() returns true show "pass" in green.</li>
            <li>If testUrl() returns false show "fail" in red.</li>
          </ul>
        </li>
        <li>
          Reset the color of the button back to indicate the test has ended
        </li>
      </ol>
      <p>
        <b>Recommendation:</b> Make the UI/layout as close as to what you see in
        the video below.
      </p>
      <iframe
        src="https://player.vimeo.com/video/556437590"
        width="640"
        height="478"
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowfullfcreen={`true`}
        title="Part1"
      ></iframe>
      <h4>Part 2:</h4>
      Add a "Get new URLs" Button that when pressed gets new set of Urls.
      Replace the previous Urls with the new ones and reset the results
      underneath each Url to “untested”.
      <p>
        <b>Note:</b> Since the URLs are dynamically generated please make sure
        hitting Test button does not regenerate new URLs.
      </p>
      <h4>Part 3:</h4>
      Suppose we want to continuously test the URLs to detect whether the server
      is alive or dead.
      <ol>
        <li>
          Add an "Auto-check" button that automatically tests each URL every 5
          seconds.
        </li>
        <li>
          The "Auto-check" button is a <b>TOGGLE</b> where re-pressing it will
          stop the automatic testing of the URLs.
        </li>
        <li>
          <b>Note:</b> Pressing the “Get New URLs” button during the automatic
          tests should generate new URLs with status of untested. The new URLs
          should be tested in the next 5 second round.
        </li>
      </ol>
      <iframe
        src="https://player.vimeo.com/video/556396090?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
        width="640"
        height="550"
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowfullfcreen={`true`}
        title="Part 2-3"
      ></iframe>
      <h4>Extra Credit</h4>
      <ul>
        <li>
          Clicking Auto-check will immediatly check the URLs and then wait 5
          seconds before the next run
        </li>
        <li>
          Clicking Auto-check will test ALL the URLs synchronously at the same
          time
        </li>
      </ul>
      <h3>CodeSandbox Auto Preview</h3>
      <span>
        By default CodeSandbox has Preview On Edit turned on. As such when you
        are coding the Browser section of CodeSandbox will refresh automatically
        and show errors. This behaviour can be turned off so that the browser is
        only updated when you save a file. Follow steps below to turn off
        Preview On Edit:
        <ol>
          <li>
            Click on{" "}
            <svg
              viewBox="0 0 10 7"
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="10"
              className="sc-bdnylx eoHNwX"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.5 5.806H0v.944h7.5v-.944zm2.25-2.903H0v.944h9.75v-.944zM0 0h9.75v.944H0V0z"
                fill="currentColor"
              ></path>
            </svg>{" "}
            menu icon next to your name on top left hand side of this page
          </li>
          <li>Select File | Preferences | CodeSandbox Settings</li>
          <li>Select Preview Tab</li>
          <li>Turn off "Preview on edit"</li>
        </ol>
      </span>
      <br />
      <br />
      <br />
      <hr />
      <button onClick={(e) => getXML(e)}>Get & Update XML</button>
      <h3>Description:</h3>
      <p>Click event will be displaying current XML file retrives as List of usernames or any other item. Also will be executting an updated XML ready to be send to a
        specific endpoint url. Open Dev Tool and Conosole to see the updated XML.
      </p>
      <h3>XML DATA:</h3>
      <div className="xml-box">
        <div className="child">
          <ul id="users"></ul>
          <h2>Current XML Response :</h2>
          <pre id="output"></pre>
        </div>
        <div className="child">
          <h2>Updated XML</h2>
          <pre id="output-2" lang="xml"></pre>
        </div>

      </div>

    </div>
  );
}



