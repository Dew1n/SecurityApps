import { service } from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
  HttpErrors,
} from '@loopback/rest';
import {Credenciales, Empleado} from '../models';
import {EmpleadoRepository} from '../repositories';
import { AutenticacionesService, NotificacionesService } from '../services';
const fetch = require("node-fetch");

export class EmpleadoController {
  constructor(
    @repository(EmpleadoRepository)
    public empleadoRepository : EmpleadoRepository,
    @service(NotificacionesService)
    public ServicioNotificaciones : NotificacionesService,
    @service(AutenticacionesService)
    public servicioAutenticaciones: AutenticacionesService
  ) {}
  
  @post("/loginEmpleado", {
    responses: {
      '200': {
        description: "Identificacion de usuarios"
      }
    }
  })
  async identificarEmpleado(
    @requestBody() Credenciales: Credenciales
  ){
    let p = await this.servicioAutenticaciones.IdentificarEmpleado(Credenciales.usuario, Credenciales.clave);
    if (p){
      let token = this.servicioAutenticaciones.GenerarTokenJWT(p);
      return{
        datos: {
          nombre: p.nombres,
          email: p.email,
          id: p.id
        },
        tk: token
      }
    }else {
      throw new HttpErrors[401]("Datos invalidos");
    }
  }

  @post('/empleados')
  @response(200, {
    description: 'Empleado model instance',
    content: {'application/json': {schema: getModelSchemaRef(Empleado)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Empleado, {
            title: 'NewEmpleado',
            exclude: ['id'],
          }),
        },
      },
    })
    empleado: Omit<Empleado, 'id'>,
  ): Promise<Empleado> {
    let clave = this.servicioAutenticaciones.GenerarClave();
    let claveCifrada = this.servicioAutenticaciones.CifrarClave(clave);
    empleado.clave = claveCifrada;
    let p = await this.empleadoRepository.create(empleado);

    //Notificar al usuario
    let destino = empleado.telefono;
    let asunto = 'Registro en la plataforma';
    let contenido = `${asunto} - Hola ${empleado.nombres} ${empleado.apellidos}, su nombre de usuario es: ${empleado.email} y su contraseña es: ${clave}`;
    this.ServicioNotificaciones.EnviarNotificacionesSMS(destino, contenido);
      return p;
  }

  @get('/empleados/count')
  @response(200, {
    description: 'Empleado model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Empleado) where?: Where<Empleado>,
  ): Promise<Count> {
    return this.empleadoRepository.count(where);
  }

  @get('/empleados')
  @response(200, {
    description: 'Array of Empleado model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Empleado, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Empleado) filter?: Filter<Empleado>,
  ): Promise<Empleado[]> {
    return this.empleadoRepository.find(filter);
  }

  @patch('/empleados')
  @response(200, {
    description: 'Empleado PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Empleado, {partial: true}),
        },
      },
    })
    empleado: Empleado,
    @param.where(Empleado) where?: Where<Empleado>,
  ): Promise<Count> {
    return this.empleadoRepository.updateAll(empleado, where);
  }

  @get('/empleados/{id}')
  @response(200, {
    description: 'Empleado model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Empleado, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Empleado, {exclude: 'where'}) filter?: FilterExcludingWhere<Empleado>
  ): Promise<Empleado> {
    return this.empleadoRepository.findById(id, filter);
  }

  @patch('/empleados/{id}')
  @response(204, {
    description: 'Empleado PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Empleado, {partial: true}),
        },
      },
    })
    empleado: Empleado,
  ): Promise<void> {
    await this.empleadoRepository.updateById(id, empleado);
  }

  @put('/empleados/{id}')
  @response(204, {
    description: 'Empleado PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() empleado: Empleado,
  ): Promise<void> {
    await this.empleadoRepository.replaceById(id, empleado);
  }

  @del('/empleados/{id}')
  @response(204, {
    description: 'Empleado DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.empleadoRepository.deleteById(id);
  }
}
