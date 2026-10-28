import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrgService } from './org.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { QueryBranchesDto } from './dto/query-branches.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Org (Chi Nhánh & Trạm Xe Giao Nhận)')
@Controller('org')
export class OrgController {
  constructor(private readonly orgService: OrgService) {}

  @Get('branches')
  @ApiOperation({ summary: 'Lấy danh sách các chi nhánh / điểm giao nhận xe' })
  async getBranches(@Query() query: QueryBranchesDto) {
    const data = await this.orgService.getBranches(
      query.includeInactive,
      query.search,
      query.province,
    );
    return {
      statusCode: HttpStatus.OK,
      data,
    };
  }

  @Get('branches/:id')
  @ApiOperation({ summary: 'Xem thông tin chi tiết một chi nhánh' })
  async getBranchById(@Param('id', ParseIntPipe) id: number) {
    const data = await this.orgService.getBranchById(id);
    return {
      statusCode: HttpStatus.OK,
      data,
    };
  }

  @Post('branches')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin/Staff: Thêm chi nhánh / trạm xe mới' })
  async createBranch(@Body() dto: CreateBranchDto) {
    const data = await this.orgService.createBranch(dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Tạo chi nhánh mới thành công',
      data,
    };
  }

  @Put('branches/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin/Staff: Cập nhật thông tin chi nhánh / trạm xe' })
  async updateBranch(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBranchDto,
  ) {
    const data = await this.orgService.updateBranch(id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Cập nhật chi nhánh thành công',
      data,
    };
  }

  @Delete('branches/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin/Staff: Xóa hoặc ngưng hoạt động chi nhánh / trạm xe' })
  async deleteBranch(@Param('id', ParseIntPipe) id: number) {
    const result = await this.orgService.deleteBranch(id);
    return {
      statusCode: HttpStatus.OK,
      message: result.message,
      data: result,
    };
  }
}
