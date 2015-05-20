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
     * @var string
     */
    private  $excludeRowsField = 'templatenum';

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

//        Yii::info('actionValidate('.$id.') : [2] a = ' . print_r($a, true));
        $result = [];

        foreach ($a[$sForm] as $k => $v) {
            $model->load($v, '');
            $model->validate();
            foreach ($model->getErrors() as $attribute => $errors) {
                $result[Html::getInputId($model, "[$k]" . $attribute)] = $errors;
            }
        }
//        Yii::info('actionValidate('.$id.'): return ' . print_r($result, true));
        return $result;

    }
}