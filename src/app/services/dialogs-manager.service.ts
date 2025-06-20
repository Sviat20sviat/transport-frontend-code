import { Injectable } from '@angular/core';
import {MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import { InfoMessageComponent } from '../components/shared/info-message/info-message.component';
import { CreatePostDialogComponent } from '../components/dialogs/create-post-dialog/create-post-dialog.component';
import { EditUserDialogComponent } from '../components/dialogs/edit-user-dialog/edit-user-dialog.component';
import { PostDialogComponent } from '../components/dialogs/post-dialog/post-dialog.component';
import { SetUserInTelegramComponent } from '../components/login/set-user-in-telegram/set-user-in-telegram.component';
import { DocumentDialogComponent } from '../components/documents/document-dialog/document-dialog.component';
import { AddressDialogComponent } from '../components/dialogs/address-dialog/address-dialog.component';
import { AddressTypes } from '../components/address-out/address-out.component';
import { PhotoDialogComponent } from '../components/dialogs/photo-dialog/photo-dialog.component';
import { WarehouseDialogComponent } from '../components/dialogs/warehouse-dialog/warehouse-dialog.component';
import { PriceListItemDialogComponent } from '../components/pricelist/price-list-item-dialog/price-list-item-dialog.component';
import { JsonDialogComponent } from '../components/dialogs/json-dialog/json-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class DialogsManagerService {

  constructor(
    private dialogRef: MatDialog
  ) { }

  openInfoMessageDialog(message: string, isConfirm?: boolean): MatDialogRef<InfoMessageComponent> {
    return this.dialogRef.open(InfoMessageComponent, {
      data: {
        message,
        isConfirm
      }
    })
  }

  openCreatePostDialog(): MatDialogRef<CreatePostDialogComponent> {
    return this.dialogRef.open(CreatePostDialogComponent, {
      data: {},
      maxHeight: "98vh",
      width:  "800px"
    });
  }

  openWarehouseDialog(warehouse?): MatDialogRef<WarehouseDialogComponent> {
    return this.dialogRef.open(WarehouseDialogComponent, {
      data: {warehouse},
      maxHeight: "98vh",
      width:  "800px"
    });
  }

  openUserDialog(user?): MatDialogRef<EditUserDialogComponent> {
    return this.dialogRef.open(EditUserDialogComponent, {
      data: {user},
      maxHeight: "auto",
      width:  "100%",
      maxWidth: "800px",
    });
  }

  openPostDialog(post?): MatDialogRef<PostDialogComponent> {
    return this.dialogRef.open(PostDialogComponent, {
      data: {post: post || null},
      maxHeight: "98vh",
      width:  "100%",
      maxWidth: "800px",
      height:  "100%"
    });
  }

  openSetUserToTelegramDialog(user): MatDialogRef<SetUserInTelegramComponent> {
    return this.dialogRef.open(SetUserInTelegramComponent, {
      data: {user}
    });
  }

  openDocumentDialog(document): MatDialogRef<DocumentDialogComponent> {
    return this.dialogRef.open(DocumentDialogComponent, {
      data: {document},
      maxHeight: "98vh",
      width:  "100%",
      maxWidth: "800px",
      height:  "auto"
    });
  }

  openAddressDialog(address?, addressType?: AddressTypes): MatDialogRef<AddressDialogComponent> {
    return this.dialogRef.open(AddressDialogComponent, {
      data: {address: address || null, addressType},
      maxHeight: "98vh",
      width:  "100%",
      maxWidth: "800px",
      height:  "auto"
    });
  }

  openPhotoDialog(imageUrl): MatDialogRef<PhotoDialogComponent> {
    return this.dialogRef.open(PhotoDialogComponent, {
      data: {imageUrl: imageUrl},
      maxHeight: "98vh",
      width:  "100%",
      maxWidth: "800px",
      height:  "100%"
    });
  }

  openPriceListItemDialog(category, item?): MatDialogRef<PriceListItemDialogComponent> {
    return this.dialogRef.open(PriceListItemDialogComponent, {
      data: {category, priceItem: item},
      maxHeight: "98vh",
      width:  "100%",
      maxWidth: "800px",
      height:  "auto"
    });
  }

  openJsonViewerDialog(data, json, prewJson?) {
    return this.dialogRef.open(JsonDialogComponent, {
      data: {data, json: json, prewJson},
      maxHeight: "98vh",
      width:  "100%",
      maxWidth: "1320px",
      height:  "auto"
    });
  }
}
