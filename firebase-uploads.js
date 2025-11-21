// Firebase Uploads Module
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "./firebase-config.js";

// Validation function
function validateUploadData(uploadData, file = null) {
  if (!uploadData.title || uploadData.title.trim().length === 0) {
    throw new Error("Judul karya tidak boleh kosong");
  }
  if (!uploadData.description || uploadData.description.trim().length === 0) {
    throw new Error("Deskripsi karya tidak boleh kosong");
  }
  if (!file && (!uploadData.imageData || typeof uploadData.imageData !== "string")) {
    throw new Error("File karya tidak boleh kosong");
  }
  if (!uploadData.app || uploadData.app.trim().length === 0) {
    throw new Error("Aplikasi tidak boleh kosong");
  }

  // File type validation
  if (file) {
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      throw new Error("File harus berupa gambar atau video");
    }
    // File size limit (25MB)
    if (file.size > 25 * 1024 * 1024) {
      throw new Error("Ukuran file maksimal 25MB");
    }
  }

  return true;
}

// Upload file to Firebase Storage
export async function uploadFileToStorage(file, fileName) {
  try {
    const storageRef = ref(storage, `uploads/${Date.now()}_${fileName}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return { downloadURL, storagePath: snapshot.ref.fullPath };
  } catch (e) {
    console.error("Error uploading file to storage:", e);
    throw new Error("Gagal mengupload file ke storage");
  }
}

// Delete file from Firebase Storage
export async function deleteFileFromStorage(storagePath) {
  try {
    if (storagePath) {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
    }
  } catch (e) {
    console.error("Error deleting file from storage:", e);
    // Don't throw error for storage deletion failures
  }
}

// Get uploads from Firestore
export async function getUploads() {
  try {
    const querySnapshot = await getDocs(collection(db, 'uploads'));
    const uploads = [];
    querySnapshot.forEach((doc) => {
      uploads.push({ id: doc.id, ...doc.data() });
    });

    // Simple and safe timestamp sorting
    uploads.sort((a, b) => {
      const getTime = (item) => {
        if (item.timestamp?.toDate) return item.timestamp.toDate().getTime();
        if (typeof item.timestamp === 'number') return item.timestamp;
        if (typeof item.timestamp === 'string') return new Date(item.timestamp).getTime();
        return 0;
      };
      return getTime(b) - getTime(a);
    });

    return uploads;
  } catch (e) {
    console.error("Error fetching from Firebase", e);
    throw new Error("Gagal memuat data dari database");
  }
}

// Save upload to Firebase (with file upload)
export async function saveUploadToFirebase(uploadData, file = null) {
  let storagePath = null;

  try {
    // Validate data
    validateUploadData(uploadData, file);

    let finalUploadData = { ...uploadData };

    // Upload file if provided
    if (file) {
      const fileName = file.name || `upload_${Date.now()}`;
      const uploadResult = await uploadFileToStorage(file, fileName);
      finalUploadData.imageData = uploadResult.downloadURL;
      storagePath = uploadResult.storagePath; // Store for rollback
      finalUploadData.storagePath = storagePath;
    }

    // Ensure timestamp
    finalUploadData.timestamp = serverTimestamp();

    console.log("Saving to Firebase...");
    const docRef = await addDoc(collection(db, 'uploads'), finalUploadData);
    console.log("Document written with ID: ", docRef.id);

    // Return complete data for UI
    return { id: docRef.id, ...finalUploadData };
  } catch (e) {
    console.error("Error saving to Firebase:", e);

    // Rollback: Delete uploaded file if Firestore save failed
    if (storagePath) {
      try {
        await deleteFileFromStorage(storagePath);
        console.log("Rolled back uploaded file due to Firestore error");
      } catch (rollbackError) {
        console.error("Failed to rollback uploaded file:", rollbackError);
      }
    }

    // User-friendly error messages
    if (e.message.includes("Judul") || e.message.includes("Deskripsi") || e.message.includes("File") || e.message.includes("Aplikasi")) {
      throw e; // Re-throw validation errors
    } else if (e.code === 'permission-denied') {
      throw new Error("Akses ditolak. Periksa konfigurasi Firebase.");
    } else if (e.code === 'unavailable') {
      throw new Error("Firebase tidak tersedia. Periksa koneksi internet.");
    } else {
      throw new Error("Gagal menyimpan ke database. Coba lagi.");
    }
  }
}

// Delete upload from Firebase (including storage file)
export async function deleteUploadFromFirebase(id) {
  let storagePath = null;
  let firestoreDeleted = false;

  try {
    // First get the document to check for storage path
    const docRef = doc(db, 'uploads', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      storagePath = data.storagePath;

      // Delete from Firestore first
      await deleteDoc(docRef);
      firestoreDeleted = true;

      // Delete from Storage if path exists
      if (storagePath) {
        await deleteFileFromStorage(storagePath);
      }
    } else {
      throw new Error("Data tidak ditemukan");
    }
  } catch (e) {
    console.error("Error deleting from Firebase", e);

    // If Firestore deletion succeeded but storage failed, log warning
    if (firestoreDeleted && storagePath) {
      console.warn(`Firestore deleted but storage deletion failed for path: ${storagePath}`);
    }

    throw new Error("Gagal menghapus data");
  }
}

// Save contact form submission to Firebase
export async function saveContactToFirebase(contactData) {
  try {
    // Validate contact data
    if (!contactData.name || contactData.name.trim().length === 0) {
      throw new Error("Nama tidak boleh kosong");
    }
    if (!contactData.type || contactData.type.trim().length === 0) {
      throw new Error("Jenis pesan tidak boleh kosong");
    }
    if (!contactData.message || contactData.message.trim().length === 0) {
      throw new Error("Pesan tidak boleh kosong");
    }

    // Prepare data
    const finalContactData = {
      ...contactData,
      timestamp: serverTimestamp(),
    };

    console.log("Saving contact to Firebase...");
    const docRef = await addDoc(collection(db, 'contacts'), finalContactData);
    console.log("Contact saved with ID: ", docRef.id);

    return { id: docRef.id, ...finalContactData };
  } catch (e) {
    console.error("Error saving contact to Firebase:", e);

    // User-friendly error messages
    if (e.message.includes("Nama") || e.message.includes("Jenis") || e.message.includes("Pesan")) {
      throw e; // Re-throw validation errors
    } else if (e.code === 'permission-denied') {
      throw new Error("Akses ditolak. Periksa konfigurasi Firebase.");
    } else if (e.code === 'unavailable') {
      throw new Error("Firebase tidak tersedia. Periksa koneksi internet.");
    } else {
      throw new Error("Gagal menyimpan pesan kontak. Coba lagi.");
    }
  }
}
