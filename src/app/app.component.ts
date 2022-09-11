import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AppFirebaseService } from './services/app-firebase.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'my-cdn';

  srcResult!: File | null;
  privateRecord = false;
  randomName = true;
  name = '';
  loading = false;

  allPublicFiles$!: Observable<any>;

  constructor(private service: AppFirebaseService) {

  }

  ngOnInit() {
    this.allPublicFiles$ = this.service.getAllPublicFiles()
  }

  onFileSelected(ref: any) {

    this.srcResult = ref.files[0];

  }

  clearFile() {
    this.srcResult = null;
  }

  resetForm() {
    this.privateRecord = false;
    this.randomName = true;
    this.name = '';
    this.clearFile()
  }

  async onSubmit() {
    if (!this.srcResult) {
      return;
    }

    this.loading = true;
    const task = await this.service.uploadFileToBucket(this.srcResult, this.payloadName, this.privateRecord)

    task.subscribe((downloadURL: string) => {
      const payload = {
        privateRecord: this.privateRecord,
        name: this.payloadName,
        type: this.srcResult?.type,
        downloadURL: downloadURL
      }
      this.service.createDocumentRecord(payload, this.privateRecord)
        .then(() => {
          this.resetForm()
          this.loading = false;
        })
    })
  }

  get payloadName(): string {
    if (this.randomName) {
      return this.generateRandomName;
    }
    return this.name || this.srcResult?.name || "";
  }

  get generateRandomName() {
    return `${Math.random()}random${new Date()}-name-${Date.now()}`
  }
}
