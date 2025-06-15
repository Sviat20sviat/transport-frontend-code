import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { DialogsManagerService } from '../../services/dialogs-manager.service';
import { StateService } from '../../services/state.service';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { UsersComponent } from '../users/users.component';
import { PostsService } from '../../services/api/posts.service';
import { ServerService } from '../../services/api/server.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { InfoMessageComponent } from '../shared/info-message/info-message.component';
import { Subject, filter, finalize, firstValueFrom, forkJoin, take, takeUntil } from 'rxjs';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';
import {
  EventNameEnum,
  WebSocketService,
} from '../../services/api/socket/web-socket.service';
import { ProfileDetailsComponent } from '../profile-details/profile-details.component';
import { MatTabsModule } from '@angular/material/tabs';
import { PostsTableComponent } from '../posts-table/posts-table.component';
import {
  CargoStatusesEnum,
  PostStatusesEnum,
} from '../dialogs/post-dialog/post-dialog.component';
import { DriverInfoComponent } from '../driver-info/driver-info.component';
import { MatInputModule } from '@angular/material/input';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DocumentsComponent } from '../documents/documents.component';
// import { YMapComponent, YMapDefaultSchemeLayerDirective } from 'angular-yandex-maps-v3';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AddressInComponent } from '../address-in/address-in.component';
import { AddressOutComponent } from '../address-out/address-out.component';
import { MutualSettlementsComponent } from '../mutual-settlements/mutual-settlements.component';
import { InputFieldComponent } from '../shared/input-field/input-field.component';
import { ContactsComponent } from '../contacts/contacts.component';
import { MatMenuModule } from '@angular/material/menu';
import { SelectFieldComponent } from '../shared/select-field/select-field.component';
import { WarehousesComponent } from '../warehouses/warehouses.component';
import { WarehouseComponent } from '../warehouse/warehouse.component';
import { CreatePriceCategoryDto, PriceListCategory, PriceListService } from '../../services/api/pricelist.service';

@Component({
  selector: 'pricelist',
  imports: [
    CommonModule,
    UsersComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    NgxUiLoaderModule,
    ProfileDetailsComponent,
    MatTabsModule,
    PostsTableComponent,
    DriverInfoComponent,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    DocumentsComponent,
    // YMapComponent, YMapDefaultSchemeLayerDirective,
    MatTooltipModule,
    AddressInComponent,
    AddressOutComponent,
    MutualSettlementsComponent,
    InputFieldComponent,
    ContactsComponent,
    MatMenuModule,
    WarehousesComponent,
    WarehouseComponent,
    SelectFieldComponent,
  ],
  templateUrl: './pricelist.component.html',
  styleUrl: './pricelist.component.scss',
})
export class PricelistComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
  pricelist: PriceListCategory[] = [];
  selectedPrice: PriceListCategory | null = null;
  isLoading = false; // Флаг для индикатора загрузки
  errorMessage: string | null = null; // Для отображения ошибок

  // Объявляем свойство для хранения нашей реактивной формы
  // Используем наш интерфейс PriceCategoryForm для строгой типизации
  categoryForm: FormGroup<PriceCategoryForm>;
  loaderId = 'pricelist-loader';
  private currentUser;

  constructor(
    private pricelistService: PriceListService,
    private fb: FormBuilder,
    private ngxService: NgxUiLoaderService,
    private dialogsManager: DialogsManagerService,
    private stateService: StateService
  ) {
    console.log('PricelistComponent: Constructor вызван');
    this.categoryForm = this.fb.group({
      name: new FormControl<string | null>(
        '',
        [
          Validators.required,
          Validators.minLength(3),
        ]
      )
    });
  }

  async ngOnInit(): Promise<void> {
    console.log('PricelistComponent: ngOnInit вызван');
    this.loadData();
    this.currentUser = await firstValueFrom(this.stateService.currentUser$.pipe(filter(user => user !== null && user !== undefined),take(1)));
  }

  ngOnDestroy(): void {
    console.log('PricelistComponent: ngOnDestroy вызван');
    this.destroy$.next(); 
    this.destroy$.complete();
    console.log('PricelistComponent: Сигнал destroy$ отправлен');
  }

  loadData(): void {
    this.ngxService.startLoader(this.loaderId);
    this.errorMessage = null;
    this.pricelistService.getCategories()
      .pipe(takeUntil(this.destroy$), finalize(() => this.ngxService.stopLoader(this.loaderId))) // Отписываемся при уничтожении
      .subscribe({
        next: (res: PriceListCategory[]) => {
          if (!res) {
            this.pricelist = [];
          } else {
            this.pricelist = res;
            if(this.selectedPrice) {
              this.selectedPrice = res.find(item => item.id === this.selectedPrice.id);
            }
          };

        },
        error: (err) => {
          this.errorMessage = err.message || 'Не удалось загрузить прайс-лист.';
          console.error('Ошибка загрузки данных:', err);
        }
      });
  }

  createPriceCategory(): void {

    if (this.categoryForm.invalid) {

      this.categoryForm.markAllAsTouched();
      this.dialogsManager.openInfoMessageDialog('Ошибка, Форма невалидна. Проверьте введенные данные.');
      return;
    }

    const categoryName = this.categoryForm.value.name!.trim();

    if (!categoryName) {
        this.categoryForm.get('name')?.setErrors({ 'required': true });
        this.categoryForm.markAllAsTouched();
        console.warn('Имя категории не может состоять только из пробелов');
        this.dialogsManager.openInfoMessageDialog('Ошибка, Форма невалидна. Проверьте введенные данные.');
        return;
    }
    this.dialogsManager.openInfoMessageDialog('Вы действительно хотите создать категорию?', true).afterClosed().subscribe(confirm => {
      if (confirm) {
        const newCategoryDto: CreatePriceCategoryDto = {
          name: categoryName
        };
    
        this.pricelistService.createCategory(newCategoryDto)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (createdCategory) => {
              this.dialogsManager.openInfoMessageDialog('Категория успешно создана.');
              console.log('Категория успешно создана:', createdCategory);
              this.isLoading = false;
    
              this.categoryForm.reset();
              this.loadData();
            },
            error: (err) => {
              this.isLoading = false;
              this.errorMessage = err.message || 'Произошла ошибка при создании категории.';
            }
          });
      }
    });



  }

  selectPriceListItem(item: PriceListCategory): void {
    this.selectedPrice = item;
  }

  openPriceListItem(item) {
    this.dialogsManager.openPriceListItemDialog(this.selectedPrice, item).afterClosed().subscribe((res) => {
      if(res) {
        this.loadData();
      };
    });
  }

  createPriceListItem() {
    this.dialogsManager.openPriceListItemDialog(this.selectedPrice).afterClosed().subscribe((res) => {
      if(res) {
        this.loadData();
      };
    });
  }

  isAdmin(): boolean {
    if(this.currentUser) {
      return this.currentUser?.roles?.some((role) => role.value == 'Admin');
    }
    return false;
  }

  deleteCategory() {
    this.dialogsManager.openInfoMessageDialog("Вы действительно хотите удалить выбранную категорию?", true).afterClosed().subscribe((confirm) => {
      if(!confirm) {
        return;
      };
      this.ngxService.startLoader(this.loaderId);
      this.pricelistService.deleteCategory(this.selectedPrice.id).subscribe(() => {
        this.loadData();
      });
    });
  }

  deletePriceItem(item) {
    this.dialogsManager.openInfoMessageDialog("Вы действительно хотите удалить выбранную позицию?", true).afterClosed().pipe(finalize(() => this.ngxService.stopLoader(this.loaderId))).subscribe((confirm) => {
      if(!confirm) {
        return;
      };
      this.ngxService.startLoader(this.loaderId);
      this.pricelistService.deleteItem(item.id).subscribe(() => {
        const index = this.selectedPrice.items.findIndex(i => i.id === item.id);
        this.selectedPrice.items.splice(index, 1);
        // this.loadData();
      });
    });
  }
}

interface PriceCategoryForm {
  name: FormControl<string | null>;
}