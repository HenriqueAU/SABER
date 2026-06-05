import { PartialType } from "@nestjs/mapped-types";
import { CreateMembroClubeDto } from "./create-membro-clube.dto";

export class UpdateMembroClubeDto extends PartialType(CreateMembroClubeDto) {}