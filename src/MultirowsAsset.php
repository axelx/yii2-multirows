<?php
/**
 * 
 * 
 * @author Victor Koxmin <promcalc@gmail.com>
 * 
 */

namespace mosedu\multirows;

use yii\web\AssetBundle;

class MultirowsAsset extends AssetBundle
{
    public $sourcePath = '';

    public $css = [];

    public $js = [
        'js/multirows.js',
    ];

    public $publishOptions = [ 'forceCopy' => true, ];

    public function init()
    {
        $this->sourcePath = __DIR__ . DIRECTORY_SEPARATOR . 'assets';
//        $sPath = \Yii::$app->assetManager->publish( __DIR__ . DIRECTORY_SEPARATOR . 'assets', ['forceCopy' => true] );
//        $js = substr($sPath[1], 1) . '/js/multirows.js';
//        $this->js[] = $js;
        parent::init();
    }

}
