<?php

namespace mosedu\multirows;

use yii\base\Widget;
use yii\web\View;
use yii\helpers\Html;

use mosedu\multirows\MultirowsAsset; 

class MultirowsWidget extends Widget
{ 
    /**
     * @var string model name to genereate form elements
     */
    public $model = null;
 
    public function init()
    {
        if ( $this->model === null ) {
            throw new InvalidConfigException("No 'model' set up for MultirowsWidget.");
        } 
    }

    public function run()
    {
        $view = $this->getView();
        $sBaseModelName = $this->model->formName();
        $sModelKey = $sBaseModelName . substr(md5(microtime()), mt_rand(0, 10), mt_rand(3, 6));
        $sRowClass = 'row' . $sModelKey; 
        $sJs = <<<EOT
jQuery(function($) {
    Multirow({
        rowclass: ".{$sRowClass}",
        model: "{$sBaseModelName}",
    });
});
EOT;
/*
        addlinkselector: "{$this->addlinkselector}",
        dellinkselector: "{$this->dellinkselector}",
        formselector: "{$this->formselector}",
        afterInsert: {$this->afterInsert},
        afterDelete: {$this->afterDelete},
        canDeleteLastRow: {$sDel}

*/
        MultirowsAsset::register($view);

        $view->registerJs($sJs, View::POS_READY, $this->model->formName() . "_multirow"); 
    }
}
