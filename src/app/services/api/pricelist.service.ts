// src/app/pricelist/pricelist.service.ts (Пример расположения файла)

import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ServerService } from './server.service';

@Injectable({
  providedIn: 'root', // Сервис будет синглтоном и доступен во всем приложении
})
export class PriceListService {
  // Базовый URL вашего NestJS API из файла окружения
  private apiUrl;

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient, private server: ServerService) {
    this.apiUrl = `${this.server.serverAddress}/price-categories`;
  }

  /**
   * Получает все категории прайс-листа с вложенными элементами.
   * @returns Observable со списком категорий.
   */
  getCategories(): Observable<PriceListCategory[]> {
    return this.http.get<PriceListCategory[]>(this.apiUrl).pipe(
      tap((data) => console.log('PriceListService: получены категории', data)), // Логирование для отладки
      catchError(this.handleError) // Обработка ошибок
    );
  }

  /**
   * Получает одну категорию прайс-листа по ID.
   * @param id - ID категории.
   * @returns Observable с найденной категорией.
   */
  getCategoryById(id: number): Observable<PriceListCategory> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<PriceListCategory>(url).pipe(
      tap((data) =>
        console.log(`PriceListService: получена категория ID=${id}`, data)
      ),
      catchError(this.handleError)
    );
  }

  /**
   * Создает новую категорию прайс-листа.
   * @param categoryDto - DTO с данными для новой категории.
   * @returns Observable с созданной категорией (возвращенной бэкендом).
   */
  createCategory(
    categoryDto: CreatePriceCategoryDto
  ): Observable<PriceListCategory> {
    return this.http
      .post<PriceListCategory>(this.apiUrl, categoryDto, this.httpOptions)
      .pipe(
        tap((newCategory) =>
          console.log(
            `PriceListService: создана категория ID=${newCategory.id}`,
            newCategory
          )
        ),
        catchError(this.handleError)
      );
  }

  /**
   * Обновляет существующую категорию прайс-листа.
   * @param id - ID категории для обновления.
   * @param categoryDto - DTO с обновленными данными (может быть частичным).
   * @returns Observable с обновленной категорией (возвращенной бэкендом).
   */
  updateCategory(
    id: number,
    categoryDto: UpdatePriceCategoryDto
  ): Observable<PriceListCategory> {
    const url = `${this.apiUrl}/${id}`;
    return this.http
      .patch<PriceListCategory>(url, categoryDto, this.httpOptions)
      .pipe(
        tap((updatedCategory) =>
          console.log(
            `PriceListService: обновлена категория ID=${id}`,
            updatedCategory
          )
        ),
        catchError(this.handleError)
      );
  }

  /**
   * Удаляет категорию прайс-листа по ID.
   * @param id - ID категории для удаления.
   * @returns Observable<void> (или Observable<object>, если бэкенд возвращает статус).
   */
  deleteCategory(id: number): Observable<void> {
    // Часто DELETE не возвращает тело
    const url = `${this.apiUrl}/${id}`;
    // Указываем { responseType: 'json' } если бэкенд что-то возвращает,
    // или оставляем как есть, если тело ответа пустое.
    // Используем <void> если тело точно пустое.
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap(() => console.log(`PriceListService: удалена категория ID=${id}`)),
      catchError(this.handleError)
    );
  }

  // --- Методы для Элементов (PriceListItem) ---
  // Вы можете добавить сюда методы для управления элементами, например:
  // - getItemsForCategory(categoryId: number): Observable<PriceListItem[]>
  // - createItemInCategory(categoryId: number, itemDto: CreatePriceListItemDto): Observable<PriceListItem>
  // - updateItem(itemId: number, itemDto: UpdatePriceListItemDto): Observable<PriceListItem>
  // - deleteItem(itemId: number): Observable<void>
  // Эти методы будут обращаться к соответствующим эндпоинтам вашего API (например, /price-categories/:categoryId/items или /price-items)

  /**
   * Приватный метод для обработки HTTP ошибок.
   * @param error - Объект HttpErrorResponse.
   * @returns Observable, который выбрасывает ошибку.
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Произошла неизвестная ошибка!';
    if (error.error instanceof ErrorEvent) {
      // Клиентская ошибка или ошибка сети
      errorMessage = `Ошибка на клиенте: ${error.error.message}`;
    } else {
      // Бэкенд вернул неуспешный код ответа.
      // Тело ответа может содержать подсказку о том, что пошло не так.
      errorMessage = `Код ошибки ${error.status}: ${error.message || ''}. `;
      // Попытка извлечь более детальное сообщение от NestJS
      if (error.error && typeof error.error === 'object') {
        if (error.error.message) {
          // Если есть поле message (стандартное для NestJS ошибок)
          errorMessage += Array.isArray(error.error.message)
            ? error.error.message.join('; ')
            : error.error.message;
        } else {
          // Иначе просто добавим тело ошибки
          errorMessage += JSON.stringify(error.error);
        }
      }
    }
    console.error('PriceListService handleError:', errorMessage); // Логируем ошибку
    // Возвращаем observable с сообщением об ошибке для конечного пользователя
    return throwError(() => new Error(errorMessage));
  }
}

// src/app/pricelist/pricelist.models.ts (Пример расположения файла)

// Интерфейс для элемента прайс-листа (соответствует PriceItem в NestJS)
export interface PriceListItem {
  id: number;
  name: string;
  commission: number | null; // Может быть null, если разрешено в модели
  sum: number;
  categoryId: number;
  // Бэкенд может включать и сам объект категории при запросе элемента, если настроено:
  // category?: PriceListCategory;
  createdAt: string | Date; // Даты могут приходить как строки ISO
  updatedAt: string | Date;
}

// Интерфейс для категории прайс-листа (соответствует PriceListCategory в NestJS)
export interface PriceListCategory {
  id: number;
  name: string;
  // Предполагаем, что бэкенд присылает элементы при запросе категорий
  items: PriceListItem[];
  createdAt: string | Date; // Даты могут приходить как строки ISO
  updatedAt: string | Date;
}

// Интерфейс для DTO создания категории (соответствует CreatePriceCategoryDto в NestJS)
export interface CreatePriceCategoryDto {
  name: string;
}

// Интерфейс для DTO обновления категории (можно использовать Partial)
export type UpdatePriceCategoryDto = Partial<CreatePriceCategoryDto>;
