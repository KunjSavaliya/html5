class footer extends HTMLElement {
    connectedCallback() {
      this.innerHTML =` <footer>

      <div style="width: 100%; display: flex;
      flex-direction: row;
      flex-wrap: wrap; "class="footer_text">
          <div  style="width: 5%;"></div>
        <div  style="width: 50%;text-align:justify;">
          <b>html5gameslive.com</b>
          <br/>
          html5gameslive is a completely new platform for the online games lovers.
          The best part is that all games available on our website are
               free and can be enjoyable on multiple devices, including desktop, mobile phones, tablets, and iPhones or iPads.s
      </div>
      <div  style="width: 10%;"></div>
        <div  style="width: 25%;">
          <h2 class="footer_text" >About</h2>
          <ul class="footer_text">
          <li style="margin-left: -40px;list-style-type: none;"><a href="./index.html">Home</a></li>
          <li style="margin-left: -40px;list-style-type: none;"><a href="./about_us.html" >About Us</a></li>
          <li style="margin-left: -40px;list-style-type: none;"><a href="./adsense_disclaimer.html" >Adsense Disclaimer</a></li>
          <li style="margin-left: -40px;list-style-type: none;"><a href="./privacy_policy.html" >Privacy Policy </a></li>
          <li style="margin-left: -40px;list-style-type: none;"><a href="./terms_of_use.html" >Tearms and Condition</a></li>
          <li style="margin-left: -40px;list-style-type: none;"><a href="./contact_us.html" >Contact US</a></li>

          </ul> </div>
        <div  style="width: 10%;"></div>
        </div>
        <div class="footer_text" style="width: 100%;">
          Copyright- 2023 <a href="./index.html"  bis_skin_checked="1">101.html5gameslive.com</a> &nbsp;&nbsp;&nbsp;&nbsp;
          <a href="./privacy_policy.html"  bis_skin_checked="1">Privacy policy</a>  &nbsp;&nbsp;&nbsp;&nbsp; <a href="./terms_of_use.html"  bis_skin_checked="1">Terms & conditions </a>
          </div>
  </footer> `

    }
  }

  customElements.define('footer-component', footer);
