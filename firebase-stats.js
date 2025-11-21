// Firebase Stats Module
import { doc, getDoc, setDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase-config.js";

// Anti-spam visitor tracking using localStorage
const VISITOR_KEY = 'portfolio_visitor_tracked';
const VISITOR_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

function hasVisitedRecently() {
  const lastVisit = localStorage.getItem(VISITOR_KEY);
  if (!lastVisit) return false;

  const timeDiff = Date.now() - parseInt(lastVisit);
  return timeDiff < VISITOR_EXPIRY;
}

function markVisitorTracked() {
  localStorage.setItem(VISITOR_KEY, Date.now().toString());
}

// Increment visitor count (with anti-spam)
export async function incrementVisitorCount() {
  try {
    if (hasVisitedRecently()) {
      console.log("Visitor already counted recently");
      return;
    }

    const visitorRef = doc(db, 'stats', 'visitors');
    await setDoc(visitorRef, {
      count: increment(1),
      lastVisit: serverTimestamp()
    }, { merge: true });

    markVisitorTracked();
    console.log("Visitor count incremented");
  } catch (e) {
    console.error("Error incrementing visitor count", e);
    // Don't throw error for visitor tracking
  }
}

// Get visitor count
export async function getVisitorCount() {
  try {
    const visitorRef = doc(db, 'stats', 'visitors');
    const docSnap = await getDoc(visitorRef);
    if (docSnap.exists()) {
      return docSnap.data().count || 0;
    } else {
      return 0;
    }
  } catch (e) {
    console.error("Error getting visitor count", e);
    return 0;
  }
}
