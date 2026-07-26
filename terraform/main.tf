terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
  subscription_id = "780945d6-b5b8-4d59-886a-23687f71b1dd"
}

resource "azurerm_resource_group" "main" {
  name     = "ecom-rg"
  location = "Central India"
}

# VNet
resource "azurerm_virtual_network" "main" {
  name                = "ecom-vnet"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
}

# Public Subnet - AKS ke liye
resource "azurerm_subnet" "aks" {
  name                 = "aks-subnet"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.1.0/24"]
}

# NSG - sirf 80, 443 allow
resource "azurerm_network_security_group" "aks" {
  name                = "aks-nsg"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
//is rume me hmne bola h port 80 se jo bhi req aaye usko allow karo aur port 443 se jo bhi req aaye usko allow karo baki sare req ko deny kar do
  security_rule {
    name                       = "allow-http"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "80"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "allow-https"
    priority                   = 110
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
}
// NSG ko subnet ke saath attach kar rahe hain.
// Is subnet me jitne bhi resources honge unpar ye NSG rules apply honge.
# NSG ko Subnet se attach karo
resource "azurerm_subnet_network_security_group_association" "aks" {
  subnet_id                 = azurerm_subnet.aks.id
  network_security_group_id = azurerm_network_security_group.aks.id
}

# AKS Cluster
resource "azurerm_kubernetes_cluster" "main" {
  name                = "ecom-aks"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  dns_prefix          = "ecom-aks"
// isme id kaha se aaya h to azure jb subnet bnata h to hr subnet koek unique id de deta h jo baut bdi string hoti h ,to hm direct id ka use krke bta dete h ki bhai ye jo vm bnane wale ho tum usko isi subnet me bnana
// Azure har subnet ko ek unique Resource ID deta hai.
// Terraform us ID ko automatically read karta hai.
// vnet_subnet_id me ye ID pass karke hum AKS ko batate hain
// ki Worker Nodes isi subnet me create hone chahiye.
  default_node_pool {
    name           = "default"
    node_count     = 1
    vm_size        = "Standard_B2als_v2"
    vnet_subnet_id = azurerm_subnet.aks.id
  }

  identity {
    type = "SystemAssigned"
  }
  //maine yaha pr  azure pligin use kiya h ,jisse kya hoga jo pod bhi bnega vo subnet se hi private ip le lega ,
  //jaise hota kya tha subnet k andr jo bhi resource bnte the unko subnet se ip milti thi thik usi trah pod ko bhi milega jb azure pulin use hoga
  //2 types of plugins hote h azure and kubenet ,azure me pod ko subnet se ip milta h aur kubenet me pod ko node ka ip milta h
  // kubernet plugn me jo pods hote h unko ip jo milti h vo vm se milti h hota kya h sare pods ek dushre se connect kaise rahte h to uske lie us vm k andr ek bridge bnta h 10.1.0.0/24 ab ye bridge un pods ko ip deta h ,is case me vnet ko pod ka ip pta hi nhi hota to req pod tk aa hi nhi pati pr vm tk aa pati h kyoki vm ko ip subnet se milti h is case me NAT aata h jo vm se pod tk request ko forward karta h aur response ko vm se bahar forward karta h
  //azure me direct pod ko ip subnet se mil jati h isliye process smooth rahta h 
  

  network_profile {
    network_plugin = "azure"
    service_cidr   = "10.1.0.0/16"
    dns_service_ip = "10.1.0.10"
  }
}

# ACR
resource "azurerm_container_registry" "main" {
  name                = "ecomacr123"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "Basic"
  admin_enabled       = true
}

# AKS ko ACR se pull karne ki permission
resource "azurerm_role_assignment" "aks_acr" {
  principal_id                     = azurerm_kubernetes_cluster.main.kubelet_identity[0].object_id
  role_definition_name             = "AcrPull"
  scope                            = azurerm_container_registry.main.id
  skip_service_principal_aad_check = true
}
