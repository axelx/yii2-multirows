<?php

namespace mosedu\multirows;

use yii\base\Widget;
use yii\web\View;
use yii\helpers\Html;

use mosedu\multirows\MultirowsAsset; 

class MultirowsWidget extends Widget
{
    public static $rowindex = 0;
    /**
     * @var string model name to genereate form elements
     */
    public $model = null;

    /**
     * @var array existing ActiveRecords of $model
     */
    public $records = array();

    /**
     * @var CActiveForm form object for render fields
     */
    public $form = null;

    /**
     * @var array default attributes for new created objects
     */
    public $defaultattributes = array();

    /**
     * @var string view path to render form fields
     */
    public $rowview = '';

    /**
     * @var string jQuery selector to find link which add new model fields
     */
    public $addlinkselector = '';

    /**
     * @var string jQuery selector to find link which delete model fields.
     */
    public $dellinkselector = '';

    /**
     * @var string jQuery selector to find form object.
     */
    public $formselector = '';

    /**
     * @var string js function to execute after insert new row, function($newRowObgect)
     */
    public $afterInsert = null;

    /**
     * @var string js function to execute after delete row, function()
     */
    public $afterDelete = null;

    /**
     * @var string tag name for one row block.
     */
    public $tag = 'div';

    /**
     * @var string scenario name for slave records.
     */
    public $scenario = '';

    /**
     * @var array tag options for one row block.
     */
    public $tagOptions = [];

    /**
     * @var bool can delete last one row
     */
    public $canDeleteLastRow = true;  

    /**
     * @var int
     */
    private  $nStartGroupRow = 0;

    public function init()
    {
        if ( $this->model === null ) {
            throw new InvalidConfigException("No 'model' set up for MultirowsWidget.");
        } 

        if ( $this->form === null ) {
            throw new InvalidConfigException("No 'form' set up for MultirowsWidget.");
        }

        if ( empty($this->tag) ) {
            throw new InvalidConfigException("Parameter 'tag' has not to be empty for MultirowsWidget.");
        }

        if( empty($this->formselector) ) {
            $this->formselector = '#' . $this->form->getId();
        }

        $this->nStartGroupRow = self::$rowindex; // запоминаем индекс на момент начала очередной группы

        parent::init();
    }

    public function run()
    {
        $view = $this->getView();

        // Добавляем пустую модель, которую будем выводить в невидую строку и по которой будем клонировать новые строки
        $ob = new $this->model;
        if (!empty($this->defaultattributes)) {
            $ob->attributes = $this->defaultattributes;
        }
        $aData = array_merge(array($ob), $this->records);

        $sBaseModelName = $ob->formName();
        $sModelKey = strtolower($sBaseModelName) . '-' . substr(md5(microtime()), mt_rand(0, 10), mt_rand(3, 6));
        $sRowClass = 'row-' . $sModelKey;

        if ( isset($this->tagOptions['class']) && !empty($this->tagOptions['class']) ) {
            $this->tagOptions['class'] .= ' ' . $sRowClass;
        } else {
            $this->tagOptions['class'] = $sRowClass;
        }

        $sRet = '';
        foreach ($aData As $k => $v) {
//            \Yii::info('MultirowsWidget: print row ' . $k);
            if ( !empty($this->scenario) ) {
                $v->scenario = $this->scenario;
            }

            $aOpt = $this->tagOptions;
            if( $k == 0 ) {
                // пустая запись для клонирования - нужно скрыть
                // пока закомментировал - будем скрывать jscript
/*
                $sDop = 'display: none;';
                if( !isset($aOpt['style']) ) {
                    $aOpt['style'] = $sDop;
                }
                else {
                    $aOpt['style'] .= ' ' . $sDop;
                }
*/
            }

            $sRet .= Html::beginTag($this->tag, $aOpt);

            $sRet .= $view->renderFile(
                          $this->rowview,
                              array(
                                  'index' => self::$rowindex, //$k,
                                  'model' => $v,
                                  'form' => $this->form,
                              )
            );
            $sRet .= Html::endTag($this->tag);
            self::$rowindex++;
        }

        if ( empty($this->afterInsert) ) {
            $this->afterInsert = 'null';
        }
        $sDel = $this->canDeleteLastRow ? 'true' : 'false'; 

        $sJs = <<<EOT
jQuery(function($) {
    Multirow({
        startindex: {$this->nStartGroupRow},
        rowclass: "{$sRowClass}",
        model: "{$sBaseModelName}",
        addlinkselector: "{$this->addlinkselector}",
        dellinkselector: "{$this->dellinkselector}",
        formselector: "{$this->formselector}",
        afterInsert: {$this->afterInsert},
        afterDelete: {$this->afterDelete},
        canDeleteLastRow: {$sDel}
    });
});
EOT;
        MultirowsAsset::register($view);

        $view->registerJs($sJs, View::POS_READY, 'multirow-' . $sModelKey);

        return $sRet;
    }
}
