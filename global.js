/* ================================== */
/*          GLOBAL HELPERS          */
/* ================================== */

// Re-export functions from modular files for backward compatibility
export { getUploads, saveUploadToFirebase, deleteUploadFromFirebase } from "./firebase-uploads.js";
export { incrementVisitorCount, getVisitorCount } from "./firebase-stats.js";
export { animateValue, showError, showSuccess } from "./ui-animation.js";
export { checkFirebaseConnection } from "./firebase-config.js";

// Legacy functions for backward compatibility (redirect to new modules)
import { getUploads as newGetUploads, saveUploadToFirebase as newSaveUpload, deleteUploadFromFirebase as newDeleteUpload } from "./firebase-uploads.js";
import { incrementVisitorCount as newIncrementVisitor, getVisitorCount as newGetVisitor } from "./firebase-stats.js";
import { animateValue as newAnimateValue, showError as newShowError, showSuccess as newShowSuccess } from "./ui-animation.js";

// Backward compatibility functions
window.getUploads = newGetUploads;
window.saveUploadToFirebase = newSaveUpload;
window.deleteUploadFromFirebase = newDeleteUpload;
window.incrementVisitorCount = newIncrementVisitor;
window.getVisitorCount = newGetVisitor;
window.animateValue = newAnimateValue;
window.showError = newShowError;
window.showSuccess = newShowSuccess;
