import { Injectable } from '@angular/core';
import { ServerService } from './server.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Интерфейс Warehouse для типизации ответа (может быть определён в другом месте)

@Injectable({
  providedIn: 'root',
})
export class WarehousesService {
  private readonly apiUrl: string;

  constructor(private server: ServerService, private http: HttpClient) {
    this.apiUrl = `${this.server.serverAddress}/warehouses`; // Базовый URL для API складов
  }

  /** Создание нового склада */
  create(createWarehouseDto: CreateWarehouseDto): Observable<Warehouse> {
    return this.http.post<Warehouse>(
      `${this.apiUrl}/create`,
      createWarehouseDto
    );
  }

  /** Обновление существующего склада */
  update(
    id: number,
    updateWarehouseDto: UpdateWarehouseDto
  ): Observable<Warehouse> {
    return this.http.post<Warehouse>(
      `${this.apiUrl}/update/${id}`,
      updateWarehouseDto
    );
  }

  /** Получение всех складов */
  getAll(): Observable<Warehouse[]> {
    return this.http.post<Warehouse[]>(`${this.apiUrl}/getAll`, {});
  }

  /** Получение одного склада по ID */
  getOne(id: number): Observable<Warehouse> {
    return this.http.post<Warehouse>(`${this.apiUrl}/getOne/${id}`, {});
  }

  /** Удаление склада по ID */
  delete(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/delete/${id}`, {});
  }

  /** Получение отфильтрованных складов */
  getFiltered(filterDto: GetFilteredWarehousesDto): Observable<Warehouse[]> {
    return this.http.post<Warehouse[]>(`${this.apiUrl}/getFiltered`, filterDto);
  }
}

export interface Warehouse {
  id: number;
  address: string;
  coordinates?: { lat: number; lng: number };
  phoneNumber?: string;
  supervisorId?: number;
  name: string;
  status: string;
  workerIds?: number[];
  createdAt: number;
}
export interface CreateWarehouseDto {
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  phoneNumber?: string;
  supervisorId?: number;
  name: string;
  status: string;
  workerIds?: number[];
}
export interface GetFilteredWarehousesDto {
  address?: string;
  supervisorId?: number;
  workerIds?: number[];
  createdFrom?: string;
  createdTo?: string;
}
export interface UpdateWarehouseDto {
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  phoneNumber?: string;
  supervisorId?: number;
  name?: string;
  status?: string;
  workerIds?: number[];
}
