let styles = require("../sass/app.scss");

const WHO = 'JS';
let greeter = (who) => 'Hello from ' + who + '!';

document.onreadystatechange = () => {
  if (document.readyState === 'complete') {
    document.getElementById('app').appendChild(
      document.createTextNode(greeter(WHO))
    );
  }
};
