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
import { Subject, finalize, forkJoin, takeUntil } from 'rxjs';
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

  constructor(
    private pricelistService: PriceListService,
    private fb: FormBuilder,
    private ngxService: NgxUiLoaderService,
  ) {
    console.log('PricelistComponent: Constructor вызван');

    // Инициализируем форму здесь (или в ngOnInit)
    // Используем FormBuilder для создания группы контролов
    this.categoryForm = this.fb.group({
      // Создаем FormControl для поля 'name'
      name: new FormControl<string | null>( // Явно указываем тип FormControl
        '', // Начальное значение - пустая строка
        [ // Массив валидаторов
          Validators.required, // Поле обязательно для заполнения
          Validators.minLength(3), // Минимальная длина - 3 символа
          // Можно добавить Validators.maxLength(255), если нужно
        ]
      )
      // Если бы были другие поля, они бы добавлялись здесь
    });
  }

  ngOnInit(): void {
    console.log('PricelistComponent: ngOnInit вызван');
    this.loadData(); // Загружаем начальные данные
  }

  ngOnDestroy(): void {
    console.log('PricelistComponent: ngOnDestroy вызван');
    this.destroy$.next(); // Отправляем сигнал
    this.destroy$.complete(); // Завершаем Subject
    console.log('PricelistComponent: Сигнал destroy$ отправлен');
  }

  loadData(): void {
    this.ngxService.startLoader(this.loaderId); // Запускаем загрузку
    this.errorMessage = null; // Сбрасываем ошибку
    this.pricelistService.getCategories()
      .pipe(takeUntil(this.destroy$), finalize(() => this.ngxService.stopLoader(this.loaderId))) // Отписываемся при уничтожении
      .subscribe({
        next: (res: PriceListCategory[]) => {
          if (!res) {
            this.pricelist = []; // Если ответ null/undefined, ставим пустой массив
          } else {
            this.pricelist = res;
          };
          console.log('Данные загружены:', this.pricelist);
        },
        error: (err) => {
          this.errorMessage = err.message || 'Не удалось загрузить прайс-лист.';
          console.error('Ошибка загрузки данных:', err);
        }
      });
  }

  /**
   * Метод для создания новой категории прайс-листа.
   * Вызывается при отправке формы.
   */
  createPriceCategory(): void {

    // 1. Проверяем валидность формы
    if (this.categoryForm.invalid) {
      console.warn('Форма невалидна');
      // Отмечаем все поля как "тронутые", чтобы отобразить ошибки валидации в шаблоне
      this.categoryForm.markAllAsTouched();
      return; // Прерываем выполнение, если форма не валидна
    }

    // 2. Получаем значение из формы и создаем DTO
    // Используем non-null assertion (!), т.к. Validators.required гарантирует наличие значения
    const categoryName = this.categoryForm.value.name!.trim(); // Убираем пробелы по краям

    // Проверяем, не осталось ли имя пустым после trim
    if (!categoryName) {
        this.categoryForm.get('name')?.setErrors({ 'required': true }); // Устанавливаем ошибку вручную
        this.categoryForm.markAllAsTouched();
        console.warn('Имя категории не может состоять только из пробелов');
        return;
    }


    const newCategoryDto: CreatePriceCategoryDto = {
      name: categoryName
    };

    console.log('Отправка DTO:', newCategoryDto);
    // 3. Вызываем метод сервиса для создания категории
    this.pricelistService.createCategory(newCategoryDto)
      .pipe(takeUntil(this.destroy$)) // Отписываемся при уничтожении
      .subscribe({
        next: (createdCategory) => {
          console.log('Категория успешно создана:', createdCategory);
          this.isLoading = false; // Выключаем индикатор загрузки

          // 4. Обработка успеха: очищаем форму и перезагружаем список
          this.categoryForm.reset(); // Сбрасываем значения и статус формы
          this.loadData(); // Обновляем список категорий
        },
        error: (err) => {
          console.error('Ошибка при создании категории:', err);
          this.isLoading = false; // Выключаем индикатор загрузки
          this.errorMessage = err.message || 'Произошла ошибка при создании категории.'; // Показываем ошибку
        }
      });
  }

  selectPriceListItem(item: PriceListCategory): void {
    this.selectedPrice = item;
  }

  openPriceListItem(item) {
    
  }
}
// Интерфейс, описывающий структуру нашей формы
interface PriceCategoryForm {
  name: FormControl<string | null>; // Поле 'name', которое будет строкой (или null изначально)
}