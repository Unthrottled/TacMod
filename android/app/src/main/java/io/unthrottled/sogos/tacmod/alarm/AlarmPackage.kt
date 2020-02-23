package io.unthrottled.sogos.tacmod.stream

import android.view.View
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ReactShadowNode
import com.facebook.react.uimanager.ViewManager
import io.unthrottled.sogos.tacmod.alarm.AlarmModule
import java.util.*

class AlarmPackage : ReactPackage {

    override fun createNativeModules(
            reactContext: ReactApplicationContext
    ): MutableList<NativeModule> =
            mutableListOf(AlarmModule(reactContext))

    override fun createViewManagers(
            reactContext: ReactApplicationContext
    ): MutableList<ViewManager<View, ReactShadowNode<*>>> =
            Collections.emptyList()
}

