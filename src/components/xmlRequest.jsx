import React from 'react';
import "../index.css";

/**@REF https://npm.devtool.tech/xsdlibrary */
import {
    xml2xsd,
    xsd2jsonSchema,
    //json2xsd,
    validateXml,
    // detectXmlSchema,
    // jsonSchema2xsd
} from 'xsdlibrary';

const XmlComponent = () => {

    /*** Retreive XML File */
    function getXML() {
        //"https://codetogo.io/api/users.xml";
        let url = 'https://hugoapgarcia.github.io/structure/user.xml';
        fetch(url)
            .then(response => response.text())
            .then(data => {
                //console.log(data);  //string
                let parser = new DOMParser();
                let xml = parser.parseFromString(data, "application/xml");
                document.getElementById('output').textContent = data;
                //console.log(xml);

                //read xml
                xmlData(xml)

                //process xml
                processFile(xml)

            });



        // var xhr = new XMLHttpRequest(); //invoke a new instance of the XMLHttpRequest
        // xhr.onload = success; // call success function if request is successful
        // xhr.onerror = error;  // call error function if request failed
        // xhr.open('GET', url); // open a GET request
        // xhr.setRequestHeader("Cache-Control", "no-cache");
        // xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
        // xhr.send(); // send the request to the server.

    }

    // function success() {
    //   var data = stringify(this.responseText); //parse the string to JSON
    //   console.log(this.responseText);
    // }

    // // function to handle error
    // function error(err) {
    //   console.log('Request Failed', err); //error details will be in the "err" object
    // }





    /*** Example of how to display values of xml from response */
    function xmlData(xml) {
        document.getElementById('users').textContent = '';

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


    /*** Retreive XSD File */
    function getXSD() {
        let url = 'https://hugoapgarcia.github.io/structure/registration.xsd';
        fetch(url)
            .then(response => response.text())
            .then(data => {
                //console.log(data);  //string
                // let parser = new DOMParser();
                // let xml = parser.parseFromString(data, "application/xml");
                document.getElementById('outputxsd').textContent = data;
                //console.log(xml);

                //process xml
                processXSDFile(data)

            });



        // var xhr = new XMLHttpRequest(); //invoke a new instance of the XMLHttpRequest
        // xhr.onload = success; // call success function if request is successful
        // xhr.onerror = error;  // call error function if request failed
        // xhr.open('GET', url); // open a GET request
        // xhr.setRequestHeader("Cache-Control", "no-cache");
        // xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
        // xhr.send(); // send the request to the server.

    }

    /*** Example of how to process file, adding new values to existin xml from response */
    function processXSDFile(data) {
        let parser = new DOMParser();
        let xml = parser.parseFromString(data, "application/xml");
      
        let primaryReg = xml.getElementsByTagName('primaryRegistration');

        let title =  xml.getElementsByTagName('title');
        title[0].removeAttribute('xsi');
        title[0].textContent= 'Engineer'
   
     
        console.log(primaryReg)


        let xmlString = new XMLSerializer().serializeToString(xml);
        document.getElementById('outputxsd2').textContent = xmlString;

        const xsd = xml2xsd(xmlString); //string data convert to xsd -> to submit to endpoint

        console.log(xmlString)
        
        // var chat = data.createElement("user");

        // var user = data.createElement("id");
        // user.appendChild(data.createTextNode("1"));

        // var content = data.createElement("name");
        // content.appendChild(data.createTextNode("Karla"));

        // var timezone = data.createElement("date");
        // let time = new Date().toISOString();
        // timezone.appendChild(data.createTextNode(time));

        // chat.appendChild(user);
        // chat.appendChild(content);
        // chat.appendChild(timezone);

        // data.getElementsByTagName("users")[0].appendChild(chat);

        // console.log(data); //check the updated new XML
        // sendXML(data, 'newXML');

        // // showing updated users
        // let newUsers = data.getElementsByTagName("users")[0];
        // let xmlText = new XMLSerializer().serializeToString(newUsers)
        // document.getElementById('output-2').textContent = xmlText;

    }

    return (<>
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
        <hr />
        <button onClick={(e) => getXSD(e)}>Get & Update XSP</button>
        <h1>PROCESING XSD DATA:</h1>
        <div className="xml-box">
            <div className="child">
                <h2>Current XSD Response :</h2>
                <pre id="outputxsd" lang="xml"></pre>
            </div>
            <div className="child">
                <h2>Updated XSD</h2>
                <pre id="outputxsd2" lang="xml"></pre>
            </div>
        </div>
    </>
    )
}

export default XmlComponent;