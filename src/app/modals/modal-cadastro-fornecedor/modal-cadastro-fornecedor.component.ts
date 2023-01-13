import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { EnderecoModel } from 'src/app/models/endereco.model';
import { FornecedorModel } from 'src/app/models/fornecedor.model';
import { CorreiosService } from 'src/app/services/correios.service';
import { EstoqueService } from 'src/app/services/estoque.service';

@Component({
  selector: 'app-modal-cadastro-fornecedor',
  templateUrl: './modal-cadastro-fornecedor.component.html',
  styleUrls: ['./modal-cadastro-fornecedor.component.scss'],
})
export class ModalCadastroFornecedorComponent implements OnInit {
  cadastraFornecedorForm!:FormGroup;

  @Input() editable:boolean = false;
  @Input() fornecedor!:FornecedorModel;

  constructor(
    private modalCtrl:ModalController,
    private formBuilder:FormBuilder,
    private service:EstoqueService,
    private correiosService:CorreiosService
  ) { }

  ngOnInit() {
    this.cadastraFornecedorForm = this.formBuilder.group({
      razaoSocial:['',[Validators.required,Validators.minLength(5),Validators.maxLength(100)]],
      cnpj:['',[Validators.required,Validators.pattern(/\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}/)]],
      contato:['',[Validators.required,Validators.pattern(/^\([1-9]{2}\) (?:[2-8]|9[1-9])[0-9]{3}\-[0-9]{4}$/)]],
      endereco:this.formBuilder.group({
        cep:['',[Validators.required,Validators.pattern(/\d{5}-?\d{3}/)]],
        uf:['',[Validators.required,Validators.minLength(2),Validators.maxLength(2)]],
        localidade:['',[Validators.required,Validators.minLength(3)]],
        bairro:['',[Validators.required,Validators.minLength(3),Validators.maxLength(100)]],
        logradouro:['',[Validators.required,Validators.minLength(3),Validators.maxLength(100)]],
        numero:['',[Validators.required,Validators.pattern(/^[0-9]+/)]]
      })
    })


    if(this.editable){
      console.log("Editar", this.fornecedor)
      this.carregaForm()
    }
  }


  cancel(){
    this.modalCtrl.dismiss(null,'cancel')
  }

  cadastraFornecedor(){
    const fornecedor = this.cadastraFornecedorForm.getRawValue() as FornecedorModel;
    this.service.cadastraFornecedor(fornecedor).subscribe({
      next:()=>this.cancel()
    });
  }

  carregaEndereco(){
    const cep = this.cadastraFornecedorForm.get('endereco')?.get('cep')?.value;
    this.correiosService.pegaEndereco(cep).subscribe({
      next:(end:EnderecoModel)=>{
        console.log(end)
        this.cadastraFornecedorForm.get('endereco')?.patchValue({
          cep:end.cep,
          uf: end.uf,
          localidade: end.localidade,
          bairro: end.bairro,
          logradouro: end.logradouro
        })
      }
    })
  }




  carregaForm(){
    this.cadastraFornecedorForm.patchValue({
      razaoSocial:this.fornecedor.razaoSocial,
      cnpj:this.fornecedor.cnpj,
      contato:this.fornecedor.contato,
      endereco:this.fornecedor.endereco,
    })
  }

  editarFornecedor(){
    const fornecedor:FornecedorModel = this.cadastraFornecedorForm.getRawValue() as FornecedorModel
    fornecedor.id = this.fornecedor.id
    console.log(fornecedor)
    this.service.atualizaFornecedor(fornecedor).subscribe({
      next:()=>{
        this.cancel()
      },
      error:(err)=>console.error(err)
    })
  }



  get razaoSocial() {return this.cadastraFornecedorForm.get('razaoSocial')!}
  get logradouro(){return this.cadastraFornecedorForm.get("endereco")?.get("logradouro")!}
  get numero(){return this.cadastraFornecedorForm.get("endereco")?.get("numero")!}






}
