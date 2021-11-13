import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Cliente,
  Empresa,
} from '../models';
import {ClienteRepository} from '../repositories';

export class ClienteEmpresaController {
  constructor(
    @repository(ClienteRepository)
    public clienteRepository: ClienteRepository,
  ) { }

  @get('/clientes/{id}/empresa', {
    responses: {
      '200': {
        description: 'Empresa belonging to Cliente',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Empresa)},
          },
        },
      },
    },
  })
  async getEmpresa(
    @param.path.string('id') id: typeof Cliente.prototype.id,
  ): Promise<Empresa> {
    return this.clienteRepository.empresa(id);
  }
}
