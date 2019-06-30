(async () => {
  const res = await fetch("./ticket/TicketCard.html");
  const textTemplate = await res.text();
  const HTMLTemplate = new DOMParser()
    .parseFromString(textTemplate, "text/html")
    .querySelector("template");

  class TicketCard extends HTMLElement {
    constructor() {
      // If you define a constructor, always call super() first as it is required by the CE spec.
      super();
    }

    get ticketId() {
      return this._ticketId;
    }

    set ticketId(val) {
      this._ticketId = val;
    }
    
    set proxyEndpoint(val) {
      this._proxyEndpoint = val;
    }
    
    get proxyEndpoint() {
      return this._proxyEndpoint;
    }
    

    // Called when element is inserted in DOM
    connectedCallback() {
      const shadowRoot = this.attachShadow({ mode: "open" });

      // Select the template and clone it. Finally attach the cloned node to the shadowDOM's root.
      // Current document needs to be defined to get DOM access to imported HTML
      const instance = HTMLTemplate.content.cloneNode(true);
      shadowRoot.appendChild(instance);

      // Extract the attribute ticket-id from our element.
      // Note that we are going to specify our cards like:
      // <ticket-card ticket-id="1" proxy-endpoint=""></ticket-card>
    //  this.ticketId = this.getAttribute("ticket-id");
    //  this.proxyEndpoint = this.getAttribute("proxy-endpoint");
      
    //  this.refresh();
    }

    refresh() {
      // Fetch the data for that user Id from the API and call the render method with this data
      const request = new Request(
        `${this.proxyEndpoint}/sap/byd/odata/v1/c4codataapi/ServiceRequestCollection?$filter=ID eq '${this.ticketId}'&$format=json`,
        {
          method: "GET",
          // credentials: 'include',
          // mode: "no-cors", // no-cors, cors, *same-origin
          headers: new Headers({
            "cache-control": "no-cache",
            "Content-Type": "application/json"
          })
        }
      );

      var that = this;
      fetch(request)
        .then(response => {
          if (response.ok) {
            response.json().then(json => {
              var oticket = json.d.results[0];
              that.render(oticket);
            });
          }
        })
        .then(data => {
          console.log(data);
        })
        .catch(error => {
          console.error(error);
        });
    }

    render(oticket) {
      // Fill the respective areas of the card using DOM manipulation APIs
      // All of our components elements reside under shadow dom. So we created a this.shadowRoot property
      // We use this property to call selectors so that the DOM is searched only under this subtree

      this.shadowRoot.querySelector("#ticketname").value = oticket.Name;
      this.shadowRoot.querySelector("#ticketpriority").value =
        oticket.ServicePriorityCode;
      this.shadowRoot.querySelector("#ticketstatus").value =
        oticket.ServiceRequestUserLifeCycleStatusCode;
      this.shadowRoot.querySelector("#ticketprocessingtype").value =
        oticket.ProcessingTypeCode;
      this.shadowRoot.querySelector("#ticketcategoryid").value =
        oticket.ServiceIssueCategoryID;
      this.shadowRoot.querySelector("#ticketprocessor").value =
        oticket.ProcessorPartyID;
    }

    // Getter to let component know what attributes
    // to watch for mutation
    static get observedAttributes() {
      return ['ticket-id', 'proxy-endpoint']; 
    }

    attributeChangedCallback(attr, oldValue, newValue) {
      console.log(`${attr} was changed from ${oldValue} to ${newValue}!`)
      const attribute = attr.toLowerCase();
      if (attribute === 'ticket-id') {
        this.ticketId = newValue;
      } else if(attribute === 'proxy-endpoint') {
        this.proxyEndpoint = newValue;
      }

      if(this.ticketId  && this.proxyEndpoint ) {
        this.refresh();
      }
    }
  }

  customElements.define("ticket-card", TicketCard);
})();
