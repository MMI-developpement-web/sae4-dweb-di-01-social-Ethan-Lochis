<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260320121658 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE Subscriptions (follower_id INT NOT NULL, following_id INT NOT NULL, INDEX IDX_B709C1F4AC24F853 (follower_id), INDEX IDX_B709C1F41816E3A3 (following_id), PRIMARY KEY (follower_id, following_id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE Subscriptions ADD CONSTRAINT FK_B709C1F4AC24F853 FOREIGN KEY (follower_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE Subscriptions ADD CONSTRAINT FK_B709C1F41816E3A3 FOREIGN KEY (following_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE Subsciptions DROP FOREIGN KEY `FK_D3942CE41816E3A3`');
        $this->addSql('ALTER TABLE Subsciptions DROP FOREIGN KEY `FK_D3942CE4AC24F853`');
        $this->addSql('DROP TABLE Subsciptions');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE Subsciptions (follower_id INT NOT NULL, following_id INT NOT NULL, INDEX IDX_D3942CE41816E3A3 (following_id), INDEX IDX_D3942CE4AC24F853 (follower_id), PRIMARY KEY (follower_id, following_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_0900_ai_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('ALTER TABLE Subsciptions ADD CONSTRAINT `FK_D3942CE41816E3A3` FOREIGN KEY (following_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE Subsciptions ADD CONSTRAINT `FK_D3942CE4AC24F853` FOREIGN KEY (follower_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE Subscriptions DROP FOREIGN KEY FK_B709C1F4AC24F853');
        $this->addSql('ALTER TABLE Subscriptions DROP FOREIGN KEY FK_B709C1F41816E3A3');
        $this->addSql('DROP TABLE Subscriptions');
    }
}
