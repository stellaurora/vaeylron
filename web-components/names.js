/**
 * Base identifier prefix for all components
 */
const BASE_NAME = "vae-";

/**
 * All web component registered names
 * (excluding baseName prefix) (not CAPITAL because its not truly constant)
 */
export const componentNames = {
    layer: "layer",
    textInput: "text-input",
    button: "button",
    modal: "modal",
    header: "header",
    checkBox: "checkbox",
    listbar: "listbar",
    dropdown: "dropdown",
    filePicker: "file-picker"
}


// Allowed "styles" types for different controls
export const ALLOWED_THEMES = {
    PRIMARY: "primary",
    SECONDARY: "secondary",
    ERROR: "error"
};

// Add baseName prefix to all componentNames (not constant)
Object.keys(componentNames).forEach(name => {
    componentNames[name] = `${BASE_NAME}${componentNames[name]}`;
});