<?php

namespace App\Controller\Admin;

use App\Entity\User;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\EmailField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;

class UserCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return User::class;
    }

    public function configureFields(string $pageName): iterable
    {
        // On n'affiche et on ne permet de modifier que l'email et le username, comme demandé.
        return [
            TextField::new('username', 'Nom d\'utilisateur'),
            EmailField::new('email', 'Adresse e-mail'),
        ];
    }
}
