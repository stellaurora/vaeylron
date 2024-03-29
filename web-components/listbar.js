import { componentNames } from "./names.js";

/**
 * Side bar component for navigation elements
 */
export class VaeListbar extends HTMLElement {
    static observedAttributes = [
        "title", "header"
    ];

    constructor() {
        super();
        this.createShadowDom();

        // Batch buffer for batching new elements
        this.batch = []
    }

    createShadowDom() {
        // Create shadow root element and attach it to the vae-listbar
        const shadow = this.attachShadow({ mode: "open" });

        // Create the title and header for this listbar
        const listbarTitle = document.createElement("h2");
        const listbarHeader = document.createElement("h4");

        // Create a slot for the normal listbar nodes
        const slotWrapper = document.createElement("div");
        const listbarSlot = document.createElement("slot");

        // Set the elements into this class for future usage
        this.title_ = listbarTitle;
        this.header_ = listbarHeader;
        this.slot_ = listbarSlot;
        this.slotWrapper_ = slotWrapper;

        // Add part attribute to help with styling
        listbarHeader.setAttribute("part", "header");
        listbarTitle.setAttribute("part", "title");
        slotWrapper.setAttribute("part", "scrollable");

        // Add the slot under a wrapper div
        slotWrapper.appendChild(listbarSlot);

        // Add them to the shadow dom for this element
        shadow.appendChild(listbarHeader);
        shadow.appendChild(listbarTitle);
        shadow.appendChild(slotWrapper);
    }

    /**
     * Callback that is called when this element is connected
     * for initialisation
     */
    connectedCallback() {
        const options = {
            root: this.slotWrapper_,
            rootMargin: "0px",
            threshold: 0.3,
        }

        // Create an observer to observe the final element in the scrollable region
        this.scrollObserver = new IntersectionObserver(
            (entries, _observer) => this.scrollObserverCallback(entries), options);

        // Set default observation to the current last child element of this node
        // (if there is one)
        if (this.lastElementChild) {
            this.scrollObserver.observe(this.lastElementChild);
        }
    }

    /**
     * Attribute changed callback to keep attributes set on html
     * in sync with class properties
     */
    attributeChangedCallback(name, _oldValue, newValue) {
        this[name] = newValue;
    }

    /**
     * Observer that is called when the final element
     * goes in or out of frame of our list bar
     * 
     * @param {[IntersectionObserverEntry]} entries 
     * @param {IntersectionObserver} observer 
     */
    scrollObserverCallback(entries) {

        // Trigger an event to signal when our final element is visible
        if (entries.length > 0 && entries.at(0).isIntersecting) {
            // Create and update event before firing
            const finalElementVisibleEvent = new Event("endreach", entries.at(0));

            this.dispatchEvent(finalElementVisibleEvent);
        }   
    }

    /**
     * "Sends" the current batch in buffer, adding them all to the
     * to the listbar.
     * 
     * @param {int} minSize - Require the buffer to the atleast this
     * size before sending else ignore.
     */
    sendBatch(minSize) {
        // minSize check.
        if (this.batch.length < minSize) {
            return;
        }

        // Add each element in the batch
        this.batch.forEach((element) => {
            this.appendChild(element);
        })

        // Observe the final element in the batch (if there is one.. for sanity purposes)
        if (this.batch.length > 0) {
            // Get the current final element to observe
            const finalElement = this.batch.at(-1);

            // Clear the batch as it has items
            this.batch.length = 0;

            this.scrollObserver.disconnect();
            this.scrollObserver.observe(finalElement);
        }
    }

    /***
     * Adds a new batch element to be added together
     */
    getNewBatchElement(callback) {
        // Create a new button element for this list bar and observe it instead
        const newElementButton = document.createElement("button");
        this.batch.push(newElementButton);

        newElementButton.addEventListener("click", callback);

        return newElementButton;
    }

    /**
     * Setters and getters for the title and header element
     */
    set title(title)    { this.title_.textContent = title;   }
    set header(header)  { this.header_.textContent = header; }

    get title()  { return this.title_.textContent;  }
    get header() { return this.header_.textContent; }

}

customElements.define(componentNames.listbar, VaeListbar);