export class CreateInventoryDto {
  name: string;
  quantity: number;
  type: string; // "MEDICAL", "FOOD"
  lat: number;
  lng: number;
  organizationId: string;
}