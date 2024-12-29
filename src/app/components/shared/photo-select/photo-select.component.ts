import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';
import { FilesService } from '../../../services/api/files.service';
import { finalize } from 'rxjs';
import { DialogsManagerService } from '../../../services/dialogs-manager.service';

@Component({
    selector: 'photo-select',
    imports: [CommonModule, NgxUiLoaderModule],
    templateUrl: './photo-select.component.html',
    styleUrl: './photo-select.component.scss'
})
export class PhotoSelectComponent implements OnInit {
  @Output() selectedFileChange = new EventEmitter<any>();
  @Input() inputImageUrl: string;
  selectedFile: File | null = null;
  imageUrl: string = null;
  loaderId = 'photo-select';

  constructor(
    private http: HttpClient,
    private ngxService: NgxUiLoaderService,
    private filesService: FilesService,
    private dialogsManager: DialogsManagerService,
  ) {
    console.log('this.inputImageUrl',this.inputImageUrl);
    if (this.inputImageUrl) {
      this.imageUrl = this.inputImageUrl;
    }
  }
  ngOnInit(): void {
    console.log('this.inputImageUrl',this.inputImageUrl);
    if (this.inputImageUrl) {
      this.imageUrl = this.inputImageUrl;
    }
  }



  onFileSelected(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      // console.log('input.files',input.files);
      this.ngxService.startLoader(this.loaderId);
      this.selectedFile = <File>event.target.files[0];
      console.log('this.selectedFile',this.selectedFile);
      console.log('this.selectedFile',this.selectedFile?.constructor?.name);

      
      const reader = new FileReader();

      reader.onload = () => {
        const fileBlob = new Blob([this.selectedFile], { type: this.selectedFile.type });
        const formData = new FormData();
        formData.append('file', this.selectedFile, this.selectedFile.name);

        console.log('formData',formData);
        this.filesService
          .uploadPhoto(formData)
          .pipe(finalize(() => this.ngxService.stopLoader(this.loaderId)))
          .subscribe((res) => {
            console.log('uploadPhoto', res);
            this.imageUrl = res?.image?.url;
            if(this.imageUrl) {
              this.selectedFileChange.emit(res?.image?.url);
            };
          });
      };
      reader.onerror = () => {
        alert('Не удалось прочитать файл.');
      };
      reader.readAsDataURL(this.selectedFile);
      // setTimeout(() => {
      //   this.filesService.uploadPhoto(formData).pipe(finalize(() => this.ngxService.stopLoader(this.loaderId))).subscribe((res) => {
      //     console.log('uploadPhoto',res);
      //     this.imageUrl = res.url;
      //   });
      // }, 1000);
    }
  }

  // Метод для загрузки файла
  onSubmit() {
    if (!this.selectedFile) {
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http.post('http://localhost:3000/images/upload', formData).subscribe({
      next: (response) => {
        console.log('Загрузка успешна:', response);
        alert('Файл успешно загружен!');
      },
      error: (err) => {
        console.error('Ошибка загрузки:', err);
        alert('Ошибка при загрузке файла.');
      },
    });
  }

  openPhotoDialog() {
    this.dialogsManager.openPhotoDialog(this.imageUrl);
  }
}
