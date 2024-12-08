import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DialogsManagerService } from '../../services/dialogs-manager.service';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { PostsService } from '../../services/api/posts.service';
import { MatDialogRef } from '@angular/material/dialog';
import { InfoMessageComponent } from '../shared/info-message/info-message.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'posts-table',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    NgxUiLoaderModule,
    MatInputModule, 
    FormsModule, 
    MatButtonModule, 
    MatIconModule
  ],
  templateUrl: './posts-table.component.html',
  styleUrl: './posts-table.component.scss'
})
export class PostsTableComponent implements OnInit, OnDestroy {
  @Input() posts: Array<any>;
  @Input() currentUser;
  @Input() isShowTitle: boolean = true;
  @Input() title: string = 'Объявления пользователей';
  unsubscribeAll$: Subject<any> = new Subject();
  loaderId = 'post-table';

  constructor(
    private dialogsManager: DialogsManagerService,
    private postsService: PostsService
  ) {

  }


  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(null);
    this.unsubscribeAll$.complete()
  }

  createPost() {
    console.log('createPost!',);
    const dialog = this.dialogsManager.openPostDialog();
    dialog.afterClosed().subscribe((res) => {
      console.log('console',res);
    })
  }

  openPostDialog(post) {
    console.log('CONSOLE!', post);
    const dialog = this.dialogsManager.openPostDialog(post);
    dialog.afterClosed().subscribe((res) => {
      console.log('afterClosed!',res);
    })
  }


  getPostExecutingStatus(status: number): string {
    switch (status) {
      case 0:
        return 'Не одобрено';
      case 1:
        return 'Одобрено';
      case 2:
        return 'В работе';
      case 3:
        return 'Выполено';
      case 4:
        return 'Отменено';
      case 5:
        return 'ЧП';
      default:
        return 'Не одобрено';
    }
  }

  deletePost(post: any) {
    const dialog = this.openConfirmDialog("Вы действительно хотите удалить объявление?");
    console.log('post!', post);
    dialog.afterClosed().pipe(takeUntil(this.unsubscribeAll$)).subscribe((confirmed: boolean) => {
      if (confirmed && post?.id) {
        console.log('confirmed!',);
        this.postsService.deletePost(post.id).subscribe((res) => {
          console.log('CONSOLE!', res);
          if (res?.deleted) {
            const index = this.posts.findIndex(p => p.id === post.id);
            this.posts.splice(index, 1);
          }
        });
        return;
      }
      console.log('not Cconfirmed',);
    })
  }

  openConfirmDialog(message): MatDialogRef<InfoMessageComponent> {
    return this.dialogsManager.openInfoMessageDialog(message, true);
  }

}
