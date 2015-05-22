<?php
/**
 * Created by PhpStorm.
 * User: KozminVA
 * Date: 20.05.2015
 * Time: 10:22
 */

namespace mosedu\multirows;

use yii;
use yii\base\Behavior;
use yii\helpers\Html;

/**
 * Class MultirowsBehavior
 * @package mosedu\multirows
 *
 * public function behaviors()    {
 *      return [
 *          'validateBehavior' => [
 *              'class' => MultirowsBehavior::className(),
 *              'model' => Model::className(),
 *          ]
 *      ];
 * }
 *
 * public function validateAction() {
 *      $result = $this->getBehavior('validateBehavior')->validateData();
 *      Yii::$app->response->format = Response::FORMAT_JSON;
 *      return $result;
 * }
 *
 */

class MultirowsBehavior extends Behavior {
    /**
     * @var string model name to genereate form elements
     */
    public $model = null;

    /**
     * @var string model primary key name
     */
    public $pk = null;

    /**
     * @var string
     */
    public $excludeRowsField = 'templatenum';

    public function validateData() {
//        Yii::$app->response->format = Response::FORMAT_JSON;

        $sClass = $this->model;
        $model = new $sClass();
        $sForm = $model->formName();

        $a = Yii::$app->request->post();
        if( isset($a[$sForm]) ) {
            if( isset($a[$sForm][$this->excludeRowsField]) ) {
                foreach($a[$sForm][$this->excludeRowsField] As $v) {
                    if( isset($a[$sForm][$v]) ) {
                        Yii::info('Unlink a['.$sForm.'][' . $v . '] = ' . print_r($a[$sForm][$v], true));
                        unset($a[$sForm][$v]);
                    }
                }
                unset($a[$sForm][$this->excludeRowsField]);
            }
        }

        Yii::info('actionValidate() : this->pk = ' . $this->pk);
//        Yii::info('actionValidate('.$id.') : [2] a = ' . print_r($a, true));
        $result = [];

        foreach ($a[$sForm] as $k => $v) {
            $ob = null;
            Yii::info('actionValidate() : v = ' . print_r($v, true));
            if( ($this->pk !== null) && isset($v[$this->pk]) ) {
                $ob = $model->findOne($v[$this->pk]);
                Yii::info('actionValidate() : find['.$v[$this->pk].'] = ' . ($ob ? print_r($ob->attributes, true) : 'null'));
            }
            if( $ob === null ) {
                $ob = $model;
                Yii::info('actionValidate() : new model');
            }
            $ob->load($v, '');
            $ob->validate();
            foreach ($ob->getErrors() as $attribute => $errors) {
                $result[Html::getInputId($ob, "[$k]" . $attribute)] = $errors;
            }
        }
//        Yii::info('actionValidate('.$id.'): return ' . print_r($result, true));
        return $result;

    }

    public function getData() {
        $sClass = $this->model;
        $model = new $sClass();
        $sForm = $model->formName();

        $a = Yii::$app->request->post();
        if( isset($a[$sForm]) ) {
            if( isset($a[$sForm][$this->excludeRowsField]) ) {
                foreach($a[$sForm][$this->excludeRowsField] As $v) {
                    if( isset($a[$sForm][$v]) ) {
                        Yii::info('Unlink a['.$sForm.'][' . $v . '] = ' . print_r($a[$sForm][$v], true));
                        unset($a[$sForm][$v]);
                    }
                }
                unset($a[$sForm][$this->excludeRowsField]);
            }
        }

//        Yii::info('actionValidate('.$id.') : [2] a = ' . print_r($a, true));
        $result = [];

        foreach ($a[$sForm] as $k => $v) {
            $model->load($v, '');
            $model->validate();
            if( $model->hasErrors() ) {
                $result[$k] = $model->getErrors();
            }
        }
//        Yii::info('actionValidate('.$id.'): return ' . print_r($result, true));
        return ['data' => $a[$sForm], 'error' => $result];

    }

    public function makeError($model, $attribute, $error, $index = null) {
        return [Html::getInputId($model, ($index !== null ? "[{$index}]" : '') . $attribute) => $errors];
    }

}