import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppFirebaseService {

  filesCollectionName = "cdn-files/v0"

  constructor(public db: AngularFirestore, private storage: AngularFireStorage) { }


  getAllPublicFiles() {
    // There are three DocumentChangeTypes in Firestore: added, removed, and modified
    return this.db.collection(`${this.filesCollectionName}/public`)
      .snapshotChanges(['added', 'removed'])
      .pipe(
        map(
          actions => actions.map((el: any) => {
            const data = el.payload.doc.data();
            const id = el.payload.doc.id;
            return { id, ...data };
          })
        )
      );
  }

  createDocumentRecord(payload: any, privateRecord: boolean) {
    const folder = privateRecord ? "private" : "public"
    return this.db.collection(`${this.filesCollectionName}/${folder}`).add(payload);
  }

  async uploadFileToBucket(file: File, name: string, privateRecord: boolean) {
    const folder = privateRecord ? "private" : "public"
    const filePath = `${this.filesCollectionName}/files/${folder}/${name}`;
    const reference = this.storage.ref(filePath);
    await this.storage.upload(filePath, file)
    return reference.getDownloadURL();
  }
}
