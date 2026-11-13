import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { OrganizationModule } from "./organization/organization.module";
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [PrismaModule, OrganizationModule, InventoryModule],
})
export class AppModule {}
